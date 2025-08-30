export class ApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown; cause?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
    if (options?.cause) (this as any).cause = options.cause;
  }
}

export class TimeoutError extends ApiError {
  constructor(message = "Request timed out", options?: { details?: unknown; cause?: unknown }) {
    super(message, { code: "timeout", details: options?.details, cause: options?.cause });
    this.name = "TimeoutError";
  }
}

export class HttpError extends ApiError {
  public readonly url: string;
  public readonly method: string;
  public readonly response?: Response;
  public readonly body?: unknown;

  constructor(
    message: string,
    opts: { status: number; url: string; method: string; response?: Response; body?: unknown; code?: string; cause?: unknown }
  ) {
    super(message, { status: opts.status, code: opts.code, details: opts.body, cause: opts.cause });
    this.name = "HttpError";
    this.url = opts.url;
    this.method = opts.method;
    this.response = opts.response;
    this.body = opts.body;
  }
}

export class RateLimitError extends HttpError {
  public readonly retryAfter?: number;
  constructor(message: string, opts: { status: number; url: string; method: string; response?: Response; body?: unknown; retryAfter?: number }) {
    super(message, { status: opts.status, url: opts.url, method: opts.method, response: opts.response, body: opts.body, code: "rate_limited" });
    this.name = "RateLimitError";
    this.retryAfter = opts.retryAfter;
  }
}

