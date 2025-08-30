import type { RequestInterceptor } from "../http/types";

export interface AuthStrategy {
  asRequestInterceptor(): RequestInterceptor;
}

export class APIKeyAuth implements AuthStrategy {
  constructor(private header: string, private key: string) {}
  asRequestInterceptor(): RequestInterceptor {
    return async (req) => {
      const headers = new Headers(req.headers);
      headers.set(this.header, this.key);
      const next = new Request(req, { headers });
      return [next, {}];
    };
  }
}

export class BearerTokenAuth implements AuthStrategy {
  constructor(private token: string) {}
  asRequestInterceptor(): RequestInterceptor {
    return async (req) => {
      const headers = new Headers(req.headers);
      headers.set("authorization", `Bearer ${this.token}`);
      const next = new Request(req, { headers });
      return [next, {}];
    };
  }
}

