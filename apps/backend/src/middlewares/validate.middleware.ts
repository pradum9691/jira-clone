import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors';

/**
 * Generic request-validation middleware.
 *
 * Pass a Zod schema shaped like `{ body, query, params }` (any subset).
 * On success, `req.body`/`req.query`/`req.params` are replaced with
 * the PARSED (and type-coerced) values. On failure, throws a
 * ValidationError (422) with the Zod issue list, which the global
 * error handler turns into the standard `{ success: false, errors }`
 * response.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register);
 */
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
