import { BaseResource } from "../baseResource";
import type { Photo, PhotoParams } from "./types";

export class PhotosResource extends BaseResource {
  list(params: PhotoParams) {
    const { page, per_page } = params;

    const queryParams: Record<string, string | number> = {};

    if (page) queryParams.page = page;
    if (per_page) queryParams.per_page = per_page;

    return this.req<Array<Photo>>({ method: "GET" })
  }

  get(id: string) {
    return this.req<Photo>({ method: "GET", path: `/${id}` })
  }

  random(count?: number) {
    return this.req<Photo | Array<Photo>>({
      method: "GET", path: "/random", query: {
        count: count ? count : null
      }
    })
  }

  statistics(id: string) {
    return this.req({ method: "GET", path: `/${id}/statistics` })
  }

  download(id: string) {
    return this.req<{ url: string }>({ method: "GET", path: `/${id}/download` })
  }
}