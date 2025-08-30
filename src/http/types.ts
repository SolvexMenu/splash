export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export type RequestOptions = {
  path: string;
  method?: HttpMethod;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  retry?: RetryOptions | boolean;
  as?: "json" | "text" | "blob" | "response";
};

export type RetryOptions = {
  retries: number;
  factor?: number;
  minTimeout?: number; // ms
  maxTimeout?: number; // ms
  retryOn?: (status: number) => boolean;
};

export type RequestInterceptor = (input: Request, init: RequestInit) => Promise<[Request, RequestInit]> | [Request, RequestInit];
export type ResponseInterceptor = (response: Response, request: Request) => Promise<Response> | Response;

