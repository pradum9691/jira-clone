import { Schema, model, Document } from "mongoose";
import {
  softDeletePlugin,
  SoftDeleteFields,
  SoftDeleteMethods,
} from "../../database/plugins/soft-delete.plugin";

export interface IUser extends Document, SoftDeleteFields, SoftDeleteMethods {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string | null;
  status: "ACTIVE" | "SUSPENDED";
  timezone: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // select: false -> never returned by default queries.
    // Must explicitly .select('+passwordHash') when needed for auth.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.plugin(softDeletePlugin);

export const User = model<IUser>("User", userSchema);
