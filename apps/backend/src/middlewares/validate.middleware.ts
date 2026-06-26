import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.issues));
      return;
    }

    const parsed = result.data as { body?: unknown; query?: unknown; params?: unknown };

    if (parsed.body !== undefined) req.body = parsed.body;
    if (parsed.query !== undefined) req.query = parsed.query as typeof req.query;
    if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;

    next();
  };
};
