import { Request } from 'express';
import { catchAsync } from '../../shared/utils/catch-async';
import { sendResponse } from '../../shared/utils/api-response';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../../shared/utils/cookie.util';
import * as authService from './auth.service';

/** Captures device/IP info from the request for refresh-token auditing. */
function getRequestMeta(req: Request): authService.RequestMeta {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
}

/**
 * POST /api/v1/auth/register
 * Creates a new user account. Does not log the user in automatically —
 * client should call /login next.
 */
export const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    data: user,
    message: 'Account created successfully',
  });
});

/**
 * POST /api/v1/auth/login
 * Verifies credentials, returns an access token in the body and
 * sets the refresh token as an httpOnly cookie.
 */
export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, getRequestMeta(req));

  setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    data: { user, accessToken },
    message: 'Logged in successfully',
  });
});

/**
 * POST /api/v1/auth/refresh-token
 * Reads the refresh token from the httpOnly cookie, rotates it, and
 * returns a new access token + sets a new refresh token cookie.
 */
export const refresh = catchAsync(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

  const { accessToken, refreshToken } = await authService.refreshTokens(rawToken, getRequestMeta(req));

  setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    data: { accessToken },
    message: 'Token refreshed successfully',
  });
});

/**
 * POST /api/v1/auth/logout
 * Revokes the current refresh token and clears its cookie.
 * The (now stale) access token simply expires naturally within 15m.
 */
export const logout = catchAsync(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

  await authService.logout(rawToken);
  clearRefreshTokenCookie(res);

  sendResponse(res, { message: 'Logged out successfully' });
});
