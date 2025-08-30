import { BaseResource } from "../baseResource";
import type { CollectionsQuery } from "./types";

export class CollectionResources extends BaseResource {
    list(params: CollectionsQuery) {
        const { page, per_page } = params;

        const queryParams: Record<string, string | number> = {};

        if (page) queryParams.page = page;
        if (per_page) queryParams.per_page = per_page;

        return this.req({ method: "GET", query: queryParams })
    }

    get(id: string) {
        return this.req({ method: "GET", path: `/${id}` })
    }

    photos(id: string) {
        return this.req({ method: "GET", path: `/${id}/photos` })
    }

    related(id: string) {
        return this.req({ method: "GET", path: `/${id}/related` })
    }
}