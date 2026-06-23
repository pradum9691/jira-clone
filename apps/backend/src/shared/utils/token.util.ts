import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';

/**
 * Payload encoded inside the short-lived ACCESS token (JWT).
 * Keep this minimal. Roles, permissions, organization membership,
 * etc. should be loaded from the database per request.
 */
export interface AccessTokenPayload {
  userId: string;
}

/**
 * Creates a short-lived access token.
 */
export function signAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies and validates an access token.
 */
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

/**
 * Generates a secure opaque refresh token.
 *
 * Raw token is sent to the client.
 * Only its SHA-256 hash is stored in MongoDB.
 */
export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Deterministic SHA-256 hash for refresh token storage.
 */
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

/**
 * Converts:
 * 30s
 * 15m
 * 24h
 * 7d
 *
 * into milliseconds.
 */
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

/**
 * Calculates refresh-token expiry date.
 */
export function getRefreshTokenExpiryDate(): Date {
  return new Date(
    Date.now() +
      parseDurationToMs(
        env.JWT_REFRESH_EXPIRES_IN
      )
  );
}
