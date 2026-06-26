import { Request } from 'express';
import { catchAsync } from '../../shared/utils/catch-async';
import { sendResponse } from '../../shared/utils/api-response';
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
} from '../../shared/utils/cookie.util';
import * as authService from './auth.service';

 
function getRequestMeta(req: Request): authService.RequestMeta {
  return {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
}

 
export const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  sendResponse(res, {
    statusCode: 201,
    data: user,
    message: 'Account created successfully',
  });
});

 
export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, getRequestMeta(req));

  setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    data: { user, accessToken },
    message: 'Logged in successfully',
  });
});

 
export const refresh = catchAsync(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

  const { accessToken, refreshToken } = await authService.refreshTokens(rawToken, getRequestMeta(req));

  setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    data: { accessToken },
    message: 'Token refreshed successfully',
  });
});

 
export const logout = catchAsync(async (req, res) => {
  const rawToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as string | undefined;

  await authService.logout(rawToken);
  clearRefreshTokenCookie(res);

  sendResponse(res, { message: 'Logged out successfully' });
});
