import { Response } from 'express';
import { env } from '../../config/env';
import { parseDurationToMs } from './token.util';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

 
export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN),
    path: '/api/v1/auth',
  });
}

 
export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/v1/auth',
  });
}
