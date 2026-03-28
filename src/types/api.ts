/**
 * Generic wrapper for every API response from the main API client.
 * The interceptor in client.ts returns response.data directly, so callers
 * receive this shape without further unwrapping.
 */
export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: number;
    success?: boolean;
    source?: string;
}

/**
 * Paginated list response.  Use when an endpoint returns a page of items
 * alongside pagination metadata.
 */
export interface PaginatedApiResponse<T> {
    data: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
}
