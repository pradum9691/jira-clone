import { NextFunction, Request, Response } from 'express';
import { AppError, NotFoundError } from '../errors/app-error';
import { env } from '../config/env';
import { logger } from '../shared/utils/logger';

/**
 * Catches any request that didn't match a route and converts it
 * into a 404 AppError, so it flows through globalErrorHandler with
 * the standard error response shape.
 *
 * Must be registered AFTER all routes, BEFORE globalErrorHandler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

/**
 * Single place where every error in the app ends up.
 *
 * - `AppError` instances (NotFoundError, ForbiddenError, etc.) →
 *   use their own statusCode/message/errors as-is.
 * - Anything else (bugs, library errors, etc.) → treated as 500,
 *   with the real message hidden in production.
 *
 * Must be registered LAST in app.ts (it has 4 args, which is how
 * Express recognizes an error-handling middleware).
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: unknown[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, message);
  } else {
    logger.warn({ path: req.originalUrl, method: req.method, statusCode }, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? [],
  });
}
