import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';

 
export interface AccessTokenPayload {
  userId: string;
}

 
export function signAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

 
export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  const decoded = jwt.verify(
    token,
    env.JWT_ACCESS_SECRET
  );

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    typeof decoded.userId !== 'string'
  ) {
    throw new Error('Invalid token payload');
  }

  return {
    userId: decoded.userId,
  };
}
 
export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString('hex');
}

 
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

 
export function parseDurationToMs(
  duration: string
): number {
  const match = duration.match(
    /^(\d+)\s*(ms|s|m|h|d)$/
  );

  if (!match) {
    throw new Error(
      `Invalid duration format: "${duration}"`
    );
  }

  const value = Number(match[1]);
  const unit = match[2] as 'ms' | 's' | 'm' | 'h' | 'd';

  const multipliers = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

 
export function getRefreshTokenExpiryDate(): Date {
  return new Date(
    Date.now() +
      parseDurationToMs(
        env.JWT_REFRESH_EXPIRES_IN
      )
  );
}
