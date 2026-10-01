import 'server-only';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiError } from '@/types/api';
import { apiBadRequest, apiInternalError, apiNotFound, apiValidationError } from './response';
import { NotFoundError, BadRequestError } from './errors';

/* --------------------- Universal Route Error Handler ---------------------- */

/**
 * Universal error handler for API route handlers.
 * Maps domain errors, Zod validation errors, JSON syntax errors,
 * and unknown exceptions to standard ApiError payloads.
 */
export function handleRouteError(
    error: unknown,
    fallbackMessage = 'Internal server error'
): NextResponse<ApiError> {
    // 1. Zod validation failure -> 422 Unprocessable Entity
    if (error instanceof z.ZodError) {
        return apiValidationError(error.issues, 'Validation failed');
    }

    // 2. Resource or file not found -> 404 Not Found
    if (error instanceof NotFoundError) {
        return apiNotFound(error.message);
    }

    // 3. Explicit bad request -> 400 Bad Request
    if (error instanceof BadRequestError) {
        return apiBadRequest(error.message);
    }

    // 4. JSON parsing / syntax error in request body -> 400 Bad Request
    if (error instanceof SyntaxError) {
        const isDev = process.env.NODE_ENV !== 'production';
        const msg = isDev
            ? `Invalid JSON in request body: ${error.message}. Note: if passing Windows paths in JSON, use forward slashes ('/') or escape backslashes ('\\\\').`
            : 'Invalid JSON payload in request body';
        return apiBadRequest(msg, { code: 'BAD_REQUEST' });
    }

    // 5. Conventional "not found" / "does not exist" Error messages -> 404 Not Found
    if (error instanceof Error) {
        const lower = error.message.toLowerCase();
        if (lower.includes('does not exist') || lower.includes('not found') || lower.includes('no such file')) {
            return apiNotFound(error.message);
        }
    }

    // 6. Unhandled internal server error (sanitized in production) -> 500
    return apiInternalError(error, fallbackMessage);
}
