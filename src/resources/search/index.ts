import { BaseResource } from "../baseResource";
import type { CollectionsParams, PhotosParams, UserParams } from "./types";

export class SearchResource extends BaseResource {
    photos(params: PhotosParams) {
        const {
            query,
            page = 1,
            per_page = 10,
            order_by = 'relevant',
            collections,
            content_filter = 'low',
            color,
            orientation
        } = params;

        const queryParams: Record<string, string | number> = {};

        if (query) queryParams.query = query;
        if (page) queryParams.page = page;
        if (per_page) queryParams.per_page = per_page;
        if (order_by) queryParams.order_by = order_by;
        if (collections) queryParams.collections = collections;
        if (content_filter) queryParams.content_filter = content_filter;
        if (color) queryParams.color = color;
        if (orientation) queryParams.orientation = orientation;

        return this.req({
            method: "GET",
            path: "/photos",
            query: queryParams
        });
    }

    collections(params: CollectionsParams) {
        const { query, page, per_page } = params;

        const queryParams: Record<string, string | number> = {};

        if (query) queryParams.query = query;
        if (page) queryParams.page = page;
        if (per_page) queryParams.per_page = per_page;

        return this.req({
            method: "GET",
            path: "/collections",
            query: queryParams
        });
    }

    users(params: UserParams) {
        const { query, page, per_page } = params;

        const queryParams: Record<string, string | number> = {};

        if (query) queryParams.query = query;
        if (page) queryParams.page = page;
        if (per_page) queryParams.per_page = per_page;

        return this.req({
            method: "GET",
            path: "/users",
            query: queryParams
        });
    }
}