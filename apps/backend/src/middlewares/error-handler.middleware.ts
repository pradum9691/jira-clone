import { NextFunction, Request, Response } from 'express';
import { AppError, NotFoundError } from '../errors/app-error';
import { env } from '../config/env';
import { logger } from '../shared/utils/logger';


export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}


export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
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
