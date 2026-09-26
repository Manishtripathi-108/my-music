import 'server-only';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ApiErrorCodes, type ApiErrorCode, type ApiFieldError, type ApiMeta, type ApiResponse } from '@/types/api';

/* -------------------------------------------------------------------------- */
/*  Options Interfaces                                                        */
/* -------------------------------------------------------------------------- */

export interface ApiSuccessOptions {
    status?: number;
    message?: string;
    meta?: ApiMeta;
    headers?: HeadersInit;
}

export interface ApiErrorOptions {
    status?: number;
    code?: ApiErrorCode;
    details?: unknown;
    headers?: HeadersInit;
}

/* -------------------------------------------------------------------------- */
/*  Core Response Builders                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Creates a standard successful API response.
 */
export function apiSuccess<T>(data: T, options: ApiSuccessOptions = {}): NextResponse<ApiResponse<T>> {
    const { status = 200, message, meta, headers } = options;

    const payload: ApiResponse<T> = {
        success: true,
        data,
        ...(message ? { message } : {}),
        ...(meta ? { meta } : {}),
    };

    return NextResponse.json(payload, { status, headers });
}

/**
 * Creates a standard 201 Created response for new resource creation.
 */
export function apiCreated<T>(data: T, options: Omit<ApiSuccessOptions, 'status'> = {}): NextResponse<ApiResponse<T>> {
    return apiSuccess(data, { ...options, status: 201 });
}

/**
 * Creates a standard 202 Accepted response for queued or asynchronous tasks.
 */
export function apiAccepted<T>(data: T, options: Omit<ApiSuccessOptions, 'status'> = {}): NextResponse<ApiResponse<T>> {
    return apiSuccess(data, { ...options, status: 202 });
}

/**
 * Creates a standard 204 No Content response.
 */
export function apiNoContent(headers?: HeadersInit): NextResponse {
    return new NextResponse(null, { status: 204, headers });
}

/**
 * Creates a standard error response.
 */
export function apiError<T = never>(message: string, options: ApiErrorOptions = {}): NextResponse<ApiResponse<T>> {
    const { status = 400, code = ApiErrorCodes.BAD_REQUEST, details, headers } = options;

    const payload: ApiResponse<T> = {
        success: false,
        error: {
            code,
            message,
            ...(details !== undefined ? { details } : {}),
        },
    };

    return NextResponse.json(payload, { status, headers });
}

/* -------------------------------------------------------------------------- */
/*  Standard HTTP Error Helpers                                               */
/* -------------------------------------------------------------------------- */

/**
 * 400 Bad Request
 */
export function apiBadRequest<T = never>(
    message: string = 'Bad request',
    options: Omit<ApiErrorOptions, 'status'> = {}
): NextResponse<ApiResponse<T>> {
    return apiError(message, {
        status: 400,
        code: options.code ?? ApiErrorCodes.BAD_REQUEST,
        ...options,
    });
}

/**
 * 401 Unauthorized
 */
export function apiUnauthorized<T = never>(
    message: string = 'Authentication required',
    options: Omit<ApiErrorOptions, 'status'> = {}
): NextResponse<ApiResponse<T>> {
    return apiError(message, {
        status: 401,
        code: options.code ?? ApiErrorCodes.UNAUTHORIZED,
        ...options,
    });
}

/**
 * 403 Forbidden
 */
export function apiForbidden<T = never>(
    message: string = 'Access denied',
    options: Omit<ApiErrorOptions, 'status'> = {}
): NextResponse<ApiResponse<T>> {
    return apiError(message, {
        status: 403,
        code: options.code ?? ApiErrorCodes.FORBIDDEN,
        ...options,
    });
}

/**
 * 404 Not Found
 */
export function apiNotFound<T = never>(
    message: string = 'Resource not found',
    options: Omit<ApiErrorOptions, 'status'> = {}
): NextResponse<ApiResponse<T>> {
    return apiError(message, {
        status: 404,
        code: options.code ?? ApiErrorCodes.NOT_FOUND,
        ...options,
    });
}

/**
 * 409 Conflict
 */
export function apiConflict<T = never>(
    message: string = 'Resource conflict',
    options: Omit<ApiErrorOptions, 'status'> = {}
): NextResponse<ApiResponse<T>> {
    return apiError(message, {
        status: 409,
        code: options.code ?? ApiErrorCodes.CONFLICT,
        ...options,
    });
}

/**
 * 429 Too Many Requests
 */
export function apiRateLimited<T = never>(
    message: string = 'Rate limit exceeded. Please slow down.',
    options: Omit<ApiErrorOptions, 'status'> = {}
): NextResponse<ApiResponse<T>> {
    return apiError(message, {
        status: 429,
        code: options.code ?? ApiErrorCodes.RATE_LIMITED,
        ...options,
    });
}

/* -------------------------------------------------------------------------- */
/*  Validation Error Formatter & Helper                                       */
/* -------------------------------------------------------------------------- */

/**
 * Formats Zod issues or custom field errors into standardized `ApiFieldError[]`.
 */
export function formatValidationIssues(issues: readonly z.core.$ZodIssue[] | readonly ApiFieldError[]): ApiFieldError[] {
    return issues.map((issue) => {
        if ('path' in issue && Array.isArray(issue.path)) {
            return {
                field: issue.path.join('.') || 'root',
                message: issue.message,
                code: issue.code,
            };
        }
        return issue as ApiFieldError;
    });
}

/**
 * 422 Unprocessable Entity - Validation Error with structured field-level errors.
 */
export function apiValidationError<T = never>(
    issues: readonly z.core.$ZodIssue[] | readonly ApiFieldError[],
    message: string = 'Validation failed',
    options: Omit<ApiErrorOptions, 'status' | 'code' | 'details'> = {}
): NextResponse<ApiResponse<T>> {
    const formattedDetails = formatValidationIssues(issues);

    return apiError(message, {
        ...options,
        status: 422,
        code: ApiErrorCodes.VALIDATION_ERROR,
        details: formattedDetails,
    });
}

/* -------------------------------------------------------------------------- */
/*  500 Internal Server Error (Sanitized in Production)                       */
/* -------------------------------------------------------------------------- */

/**
 * 500 Internal Server Error
 *
 * Logs the unhandled exception on the server, but sanitizes response details
 * to prevent leaking internal stack traces, paths, or secrets to the client.
 */
export function apiInternalError<T = never>(
    error?: unknown,
    message: string = 'Internal server error',
    options: Omit<ApiErrorOptions, 'status' | 'code'> = {}
): NextResponse<ApiResponse<T>> {
    // Log real server error with context
    console.error('[API Internal Error]', {
        message,
        error: error instanceof Error ? (error.stack ?? error.message) : error,
        timestamp: new Date().toISOString(),
    });

    const isDevelopment = process.env.NODE_ENV !== 'production';

    // In dev, expose error message for debugging; in prod, keep details strictly hidden
    const details = isDevelopment && error instanceof Error ? { debugMessage: error.message } : undefined;

    return apiError(message, {
        ...options,
        status: 500,
        code: ApiErrorCodes.INTERNAL_SERVER_ERROR,
        ...(details ? { details } : {}),
    });
}
