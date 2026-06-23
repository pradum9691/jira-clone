import { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async controller/handler so that any rejected Promise
 * (thrown error or `throw new AppError(...)`) is automatically
 * passed to `next()` — and therefore reaches `globalErrorHandler`.
 *
 * Without this, every controller would need its own try/catch.
 *
 * Usage:
 *   router.post('/', catchAsync(async (req, res) => {
 *     const org = await orgService.create(req.body);
 *     sendResponse(res, { statusCode: 201, data: org });
 *   }));
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
