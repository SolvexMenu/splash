export { SplashClient } from "./src/client";
export type { ClientOptions } from "./src/client";

export { ApiError, TimeoutError, HttpError, RateLimitError } from "./src/core/errors";
export type { RequestOptions, RequestInterceptor, ResponseInterceptor } from "./src/http/types";
export { APIKeyAuth, BearerTokenAuth, type AuthStrategy } from "./src/core/auth";
