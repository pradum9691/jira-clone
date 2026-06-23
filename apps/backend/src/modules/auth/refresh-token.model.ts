import { Schema, model, Document, Types } from "mongoose";

/**
 * refresh_tokens
 *
 * Supports refresh token rotation + reuse detection:
 * - On every /auth/refresh-token call, the current token is marked
 *   revoked and `replacedByToken` is set to the new token's hash.
 * - If a token that is already `isRevoked: true` is presented again,
 *   that's a reuse signal -> revoke the entire token family
 *   (all tokens for that userId) and force re-login.
 *
 * `token` stores a HASH of the raw refresh token (e.g. SHA-256),
 * never the raw value, in case the DB is ever compromised.
 */
export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  familyId: string; 
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  replacedByToken?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  revokedAt?: Date | null;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    revokedAt: {
  type: Date,
  default: null,
},
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// MongoDB TTL index: auto-delete documents once expiresAt has passed.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);
