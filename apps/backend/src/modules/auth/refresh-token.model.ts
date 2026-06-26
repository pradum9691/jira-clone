import { Schema, model, Document, Types } from "mongoose";
 
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
 
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema,
);
