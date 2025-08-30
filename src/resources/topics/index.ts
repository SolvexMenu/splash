import { BaseResource } from "../baseResource";

export class TopicsResources extends BaseResource {
    list() {
        return this.req({ method: "GET" })
    }

    get(id_or_slug: string) {
        return this.req({ method: "GET", path: `/${id_or_slug}` })
    }

    photos(id_or_slug: string) {
        return this.req({ method: "GET", path: `/${id_or_slug}/photos` })
    }
}