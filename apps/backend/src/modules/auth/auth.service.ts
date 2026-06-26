import crypto from "crypto";

import { User, IUser } from "../users/user.model";
import { RefreshToken } from "./refresh-token.model";

import {
  hashPassword,
  comparePassword,
} from "../../shared/utils/password.util";

import {
  signAccessToken,
  generateRefreshTokenValue,
  hashToken,
  getRefreshTokenExpiryDate,
} from "../../shared/utils/token.util";

import {
  ConflictError,
  UnauthorizedError,
} from "../../errors";

import {
  RegisterInput,
  LoginInput,
} from "./auth.validation";

 
export interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}
 
function toSafeUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,

    avatarUrl: user.avatarUrl ?? null,

    status: user.status,

    timezone: user.timezone,
    isEmailVerified: user.isEmailVerified,

    createdAt: user.createdAt,
  };
}

 
export async function register(input: RegisterInput) {
  const existing = await User.findOne({
    email: input.email,
  });

  if (existing) {
    throw new ConflictError(
      "An account with this email already exists"
    );
  }

  const passwordHash = await hashPassword(
    input.password
  );

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  return toSafeUser(user);
}
 
export async function login(
  input: LoginInput,
  meta: RequestMeta
) {
  const user = await User.findOne({
    email: input.email,
  }).select("+passwordHash");

  if (!user) {
    throw new UnauthorizedError(
      "Invalid email or password"
    );
  }

  const isPasswordValid =
    await comparePassword(
      input.password,
      user.passwordHash
    );

  if (!isPasswordValid) {
    throw new UnauthorizedError(
      "Invalid email or password"
    );
  }

  user.lastLoginAt = new Date();

  await user.save({
    validateBeforeSave: false,
  });

  const accessToken = signAccessToken({
    userId: user._id.toString(),
  });

  const refreshTokenValue =
    generateRefreshTokenValue();

  const familyId = crypto.randomUUID();

  await RefreshToken.create({
    userId: user._id,

    familyId,

    token: hashToken(
      refreshTokenValue
    ),

    expiresAt:
      getRefreshTokenExpiryDate(),

    userAgent:
      meta.userAgent ?? null,

    ipAddress:
      meta.ipAddress ?? null,
  });

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken:
      refreshTokenValue,
  };
}

 
export async function refreshTokens(
  rawToken: string | undefined,
  meta: RequestMeta
) {
  if (!rawToken) {
    throw new UnauthorizedError(
      "Refresh token missing"
    );
  }

  const hashedIncoming =
    hashToken(rawToken);

  const existing =
    await RefreshToken.findOne({
      token: hashedIncoming,
    });

  if (!existing) {
    throw new UnauthorizedError(
      "Invalid refresh token"
    );
  }

  
  if (existing.isRevoked) {
    await RefreshToken.updateMany(
      {
        familyId:
          existing.familyId,
        isRevoked: false,
      },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      }
    );

    throw new UnauthorizedError(
      "Session expired. Please log in again."
    );
  }

  if (
    existing.expiresAt.getTime() <
    Date.now()
  ) {
    throw new UnauthorizedError(
      "Refresh token expired. Please log in again."
    );
  }

  const newRefreshTokenValue =
    generateRefreshTokenValue();

  const newHashed =
    hashToken(
      newRefreshTokenValue
    );

  existing.isRevoked = true;
  existing.revokedAt =
    new Date();

  existing.replacedByToken =
    newHashed;

  await existing.save();

  await RefreshToken.create({
    userId: existing.userId,

    familyId:
      existing.familyId,

    token: newHashed,

    expiresAt:
      getRefreshTokenExpiryDate(),

    userAgent:
      meta.userAgent ?? null,

    ipAddress:
      meta.ipAddress ?? null,
  });

  const accessToken =
    signAccessToken({
      userId:
        existing.userId.toString(),
    });

  return {
    accessToken,
    refreshToken:
      newRefreshTokenValue,
  };
}

 
export async function logout(
  rawToken:
    | string
    | undefined
): Promise<void> {
  if (!rawToken) {
    return;
  }

  const hashed =
    hashToken(rawToken);

  await RefreshToken.updateOne(
    {
      token: hashed,
    },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    }
  );
}
