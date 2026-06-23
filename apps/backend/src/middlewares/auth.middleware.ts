import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors";
import { verifyAccessToken } from "../shared/utils/token.util";

/**
 * Protects routes by requiring a valid `Authorization: Bearer <token>`
 * header. On success, attaches `{ userId }` to `req.user` for
 * downstream controllers/services to use.
 *
 * Usage:
 *   router.get('/me', authenticate, userController.getMe);
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(new UnauthorizedError("Authentication token missing"));
    return;
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    next(new UnauthorizedError("Authentication token missing"));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}
