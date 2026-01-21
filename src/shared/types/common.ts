/**
 * Common Type Definitions
 *
 * Shared types used across the application.
 */

/**
 * Async operation status for screen hooks
 */
export type AsyncStatus = "loading" | "error" | "empty" | "success";

/**
 * Pagination state
 */
export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationState;
}

/**
 * Sort direction
 */
export type SortDirection = "asc" | "desc";

/**
 * Sort state
 */
export interface SortState {
    field: string;
    direction: SortDirection;
}

/**
 * Filter state (generic)
 */
export interface FilterState {
    [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * API error response
 */
export interface ApiError {
    message: string;
    code?: string;
    details?: Record<string, string[]>;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    error?: ApiError;
}

/**
 * Selection state for tables/lists
 */
export interface SelectionState<T = string> {
    selected: T[];
    selectAll: boolean;
}

/**
 * Date range
 */
export interface DateRange {
    start: Date | null;
    end: Date | null;
}
