import { BaseResource } from "../baseResource";
import type { Photo } from "./types";

export class PhotosResource extends BaseResource {
  list() {
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