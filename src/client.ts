import { HttpClient, type HttpClientOptions } from "./http/httpClient";
import type { RetryOptions, RequestInterceptor, ResponseInterceptor } from "./http/types";
import type { AuthStrategy } from "./core/auth";
import { PhotosResource } from "./resources/photos";
import { SearchResource } from "./resources/search";
import { CollectionResources } from "./resources/collections";
import { TopicsResources } from "./resources/topics";

export type ClientOptions = {
  baseUrl: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retry?: RetryOptions | boolean;
  auth?: AuthStrategy | AuthStrategy[];
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
  fetchImpl?: typeof fetch;
};

export class SplashClient {
  private http: HttpClient;

  public readonly photos: PhotosResource;
  public readonly search: SearchResource;
  public readonly collections: CollectionResources;
  public readonly topics: TopicsResources;

  constructor(options: ClientOptions) {
    const requestInterceptors = [...(options.requestInterceptors ?? [])];
    const auth = Array.isArray(options.auth) ? options.auth : options.auth ? [options.auth] : [];
    for (const a of auth) requestInterceptors.push(a.asRequestInterceptor());

    const httpOptions: HttpClientOptions = {
      baseUrl: options.baseUrl,
      headers: options.headers,
      timeoutMs: options.timeoutMs,
      retry: options.retry === true ? { retries: 2 } : (options.retry as any),
      requestInterceptors,
      responseInterceptors: options.responseInterceptors,
      fetchImpl: options.fetchImpl,
    };

    this.http = new HttpClient(httpOptions);

    // Instantiate resources
    this.photos = new PhotosResource(this.http as any, "/photos");
    this.search = new SearchResource(this.http as any, "/search");
    this.collections = new CollectionResources(this.http as any, "/collections");
    this.topics = new TopicsResources(this.http as any, "/topics")
  }

  setHeader(key: string, value?: string) { this.http.setHeader(key, value); }
}

