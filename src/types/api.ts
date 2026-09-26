/**
 * Standardized API response contracts for all endpoints across the project.
 *
 * Every API endpoint must return an `ApiResponse<T>`, which discriminates on `success`.
 * - When `success === true`: `ApiSuccess<T>` is returned with `data`, optional `message`, and optional `meta`.
 * - When `success === false`: `ApiError` is returned with a standardized `error` object.
 */

/* -------------------------------------------------------------------------- */
/*  Standard Machine-Readable Error Codes                                     */
/* -------------------------------------------------------------------------- */

export const ApiErrorCodes = {
    // 400 Bad Request
    BAD_REQUEST: 'BAD_REQUEST',
    MALFORMED_JSON: 'MALFORMED_JSON',
    INVALID_QUERY_PARAMS: 'INVALID_QUERY_PARAMS',

    // 422 Validation Error
    VALIDATION_ERROR: 'VALIDATION_ERROR',

    // 401 Unauthorized
    UNAUTHORIZED: 'UNAUTHORIZED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',

    // 403 Forbidden
    FORBIDDEN: 'FORBIDDEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

    // 404 Not Found
    NOT_FOUND: 'NOT_FOUND',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

    // 409 Conflict
    CONFLICT: 'CONFLICT',
    ALREADY_EXISTS: 'ALREADY_EXISTS',

    // 429 Too Many Requests
    RATE_LIMITED: 'RATE_LIMITED',

    // 500 / 503 Internal & External Server Errors
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

export type ApiErrorCode = (typeof ApiErrorCodes)[keyof typeof ApiErrorCodes] | (string & {});

/* -------------------------------------------------------------------------- */
/*  Metadata Structures                                                       */
/* -------------------------------------------------------------------------- */

export interface ApiPaginationMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ApiCursorMeta {
    nextCursor?: string | null;
    prevCursor?: string | null;
    hasMore: boolean;
}

export interface ApiMeta {
    pagination?: ApiPaginationMeta;
    cursor?: ApiCursorMeta;
    timestamp?: string;
    requestId?: string;
    [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*  Field-Level Validation Error Detail                                       */
/* -------------------------------------------------------------------------- */

export interface ApiFieldError {
    field: string;
    message: string;
    code?: string;
}

/* -------------------------------------------------------------------------- */
/*  Error Response Structure                                                  */
/* -------------------------------------------------------------------------- */

export interface ApiErrorDetail {
    code: ApiErrorCode;
    message: string;
    details?: ApiFieldError[] | Record<string, unknown> | unknown;
}

export interface ApiError {
    success: false;
    error: ApiErrorDetail;
}

/* -------------------------------------------------------------------------- */
/*  Success Response Structure                                                */
/* -------------------------------------------------------------------------- */

export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
    meta?: ApiMeta;
}

/* -------------------------------------------------------------------------- */
/*  Root Discriminated Union                                                  */
/* -------------------------------------------------------------------------- */

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/* -------------------------------------------------------------------------- */
/*  Type Guards                                                               */
/* -------------------------------------------------------------------------- */

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
    return response.success === true;
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
    return response.success === false;
}
