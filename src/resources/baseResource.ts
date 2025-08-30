import type { HttpClient } from "../http/httpClient";
import type { RequestOptions } from "../http/types";

export abstract class BaseResource {
  protected client: HttpClient;
  protected basePath: string;

  constructor(client: HttpClient, basePath: string) {
    this.client = client;
    this.basePath = basePath.replace(/\/$/, "");
  }

  protected req<T = unknown>(opts: Omit<RequestOptions, "path"> & { path?: string }) {
    const path = `${this.basePath}${opts.path ?? ""}`;
    return this.client.request<T>({ ...opts, path });
  }
}

