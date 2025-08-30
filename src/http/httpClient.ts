import type { BodyInit } from "bun";
import { HttpError, RateLimitError, TimeoutError } from "../core/errors";
import { addQuery } from "../utils/query";
import type { RequestOptions, RetryOptions, RequestInterceptor, ResponseInterceptor } from "./types";

export type HttpClientOptions = {
  baseUrl: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retry?: RetryOptions;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
  fetchImpl?: typeof fetch;
};

export class HttpClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeoutMs: number;
  private retry?: RetryOptions;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private fetchImpl: typeof fetch;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.headers = options.headers ?? {};
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.retry = options.retry;
    this.requestInterceptors = options.requestInterceptors ?? [];
    this.responseInterceptors = options.responseInterceptors ?? [];
    this.fetchImpl = options.fetchImpl ?? (globalThis.fetch as typeof fetch);
    if (!this.fetchImpl) throw new Error("No fetch implementation available. Provide fetchImpl or use Node 18+/browsers.");
  }

  setHeader(key: string, value?: string) {
    if (value === undefined) delete this.headers[key];
    else this.headers[key] = value;
  }

  addRequestInterceptor(i: RequestInterceptor) { this.requestInterceptors.push(i); }
  addResponseInterceptor(i: ResponseInterceptor) { this.responseInterceptors.push(i); }

  async request<T = unknown>(opts: RequestOptions): Promise<T | Response | string | Blob> {
    const method = opts.method ?? "GET";
    const url = this.buildUrl(opts.path, opts.query);
    const headers: Record<string, string> = { "content-type": "application/json", ...this.headers, ...(opts.headers ?? {}) };
    const body = this.serializeBody(opts.body, headers);
    const as = opts.as ?? "json";

    const attempt = async (attemptNo: number): Promise<T | Response | string | Blob> => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? this.timeoutMs);
      const init: RequestInit = { method, headers, body, signal: this.mergeSignals(controller.signal, opts.signal) };
      let request = new Request(url, init);

      try {
        for (const interceptor of this.requestInterceptors) {
          const res = await interceptor(request, init);
          request = res[0];
        }

        let response = await this.fetchImpl(request);

        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response, request);
        }

        if (!response.ok) {
          const status = response.status;
          let parsed: any = undefined;
          try { parsed = await safeParseJson(response); } catch {}
          if (status === 429) {
            const ra = parseRetryAfter(response.headers.get("retry-after"));
            throw new RateLimitError("Rate limited", { status, url, method, response, body: parsed, retryAfter: ra });
          }
          throw new HttpError(`HTTP ${status} ${response.statusText}`, { status, url, method, response, body: parsed });
        }

        clearTimeout(timeout);
        switch (as) {
          case "response": return response;
          case "text": return response.text();
          case "blob": return response.blob() as any;
          case "json":
          default:
            if (response.status === 204) return undefined as any;
            return (await response.json()) as T;
        }
      } catch (err: any) {
        clearTimeout(timeout);
        if (err?.name === "AbortError") throw new TimeoutError("Request timed out", { cause: err });
        // Retry policy
        const retryConf = normalizeRetry(opts.retry ?? this.retry);
        if (retryConf && shouldRetry(err, attemptNo, retryConf)) {
          await wait(backoffMs(attemptNo, retryConf));
          return attempt(attemptNo + 1);
        }
        throw err;
      }
    };

    return attempt(1);
  }

  private buildUrl(path: string, query?: Record<string, any>): string {
    const full = path.startsWith("http") ? path : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    return addQuery(full, query);
  }

  private serializeBody(body: unknown, headers: Record<string, string>): BodyInit | undefined {
    if (body === undefined || body === null) return undefined;
    const ct = headers["content-type"]?.toLowerCase();
    if (typeof FormData !== "undefined" && body instanceof FormData) {
      delete headers["content-type"]; // Browser will set boundary
      return body;
    }
    if (ct?.includes("application/json") || !ct) {
      headers["content-type"] = "application/json";
      return JSON.stringify(body);
    }
    if (ct?.includes("application/x-www-form-urlencoded")) {
      const sp = new URLSearchParams(body as any);
      return sp as any;
    }
    return body as any;
  }

  private mergeSignals(a: AbortSignal, b?: AbortSignal) {
    if (!b) return a;
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    a.addEventListener("abort", onAbort);
    b.addEventListener("abort", onAbort);
    return controller.signal;
  }
}

function normalizeRetry(r?: RetryOptions | boolean): RetryOptions | undefined {
  if (r === false) return undefined;
  if (r === true) return { retries: 2, factor: 2, minTimeout: 300, maxTimeout: 2000, retryOn: defaultRetryOn };
  if (!r) return undefined;
  return { retries: r.retries, factor: r.factor ?? 2, minTimeout: r.minTimeout ?? 300, maxTimeout: r.maxTimeout ?? 2000, retryOn: r.retryOn ?? defaultRetryOn };
}

function defaultRetryOn(status: number) {
  return status >= 500 || status === 429;
}

function shouldRetry(err: any, attemptNo: number, r: RetryOptions) {
  if (attemptNo > r.retries) return false;
  if (err instanceof RateLimitError) return true;
  if (err instanceof HttpError) return r.retryOn ? r.retryOn(err.status ?? 0) : false;
  if (err instanceof TimeoutError) return true;
  return false;
}

function backoffMs(attemptNo: number, r: RetryOptions) {
  const ms = Math.min(r.maxTimeout ?? 2000, (r.minTimeout ?? 300) * Math.pow(r.factor ?? 2, attemptNo - 1));
  return ms;
}

function wait(ms: number) { return new Promise((res) => setTimeout(res, ms)); }

async function safeParseJson(response: Response): Promise<any> {
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = Number(value);
  if (!Number.isNaN(num)) return num * 1000;
  const date = new Date(value).getTime();
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}
