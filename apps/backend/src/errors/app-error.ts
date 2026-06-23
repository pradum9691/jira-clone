/**
 * Base operational error class.
 *
 * All intentional, "expected" errors (validation failures, not-found,
 * forbidden, etc.) should extend this. The global error handler checks
 * `instanceof AppError` to decide the response shape and status code.
 *
 * Errors that are NOT AppError (unexpected bugs, library errors) are
 * treated as 500s and their details are hidden in production.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(message: string, statusCode: number, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — malformed request (bad params, invalid combination of inputs) */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors?: unknown[]) {
    super(message, 400, errors);
  }
}

/** 401 — missing/invalid credentials or expired token */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/** 403 — authenticated, but lacks permission (RBAC failure) */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/** 404 — resource does not exist (or is soft-deleted) */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/** 409 — conflicts with existing data (e.g. duplicate slug/email) */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

/** 422 — input failed schema validation (Zod) */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors?: unknown[]) {
    super(message, 422, errors);
  }
}
