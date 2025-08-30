export interface PhotosParams {
    query: string;
    page?: number;
    per_page?: number;
    order_by?: 'latest' | 'relevant';
    collections?: string;
    content_filter?: 'low' | 'high';
    color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
    orientation?: 'landscape' | 'portrait' | 'squarish';
}

export interface CollectionsParams {
    query: string;
    page?: number | 1;
    per_page?: number | 10;
}

export interface UserParams {
    query: string;
    page?: number | 1;
    per_page?: number | 10;
}