import 'server-only';

/**
 * Thrown when a requested resource or file does not exist.
 */
export class NotFoundError extends Error {
    constructor(message: string = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

/**
 * Thrown when a client request violates domain business rules.
 */
export class BadRequestError extends Error {
    constructor(message: string = 'Bad request') {
        super(message);
        this.name = 'BadRequestError';
    }
}

/**
 * Thrown when access to a resource or path is not permitted.
 */
export class ForbiddenError extends Error {
    constructor(message: string = 'Access forbidden') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

/**
 * Thrown when a conflict with existing state occurs.
 */
export class ConflictError extends Error {
    constructor(message: string = 'Resource conflict') {
        super(message);
        this.name = 'ConflictError';
    }
}
