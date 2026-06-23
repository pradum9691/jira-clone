import { Response } from 'express';
import { env } from '../../config/env';
import { parseDurationToMs } from './token.util';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

/**
 * Sets the refresh token as an httpOnly cookie.
 *
 * - httpOnly: JS on the page cannot read it (XSS protection)
 * - secure: only sent over HTTPS in production
 * - sameSite:
 *     - "none" in production (frontend on Vercel, backend on Render
 *       are different domains — cross-site cookies require "none" + secure)
 *     - "lax" in development (localhost, same-site is fine)
 * - path: scoped to /api/v1/auth so it's only sent on auth requests
 */
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
    path: '/api/v1/auth',
  });
}

/**
 * Clears the refresh token cookie (used on logout).
 * Options must match those used in setRefreshTokenCookie for the
 * browser to actually remove it.
 */
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/v1/auth',
  });
}
