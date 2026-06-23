import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(5000),

  CLIENT_URL: z.string().url(),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET should be at least 32 characters'),

  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET should be at least 32 characters'),

  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Future integrations
  REDIS_URL: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid/missing environment variables');
  console.error(
    JSON.stringify(
      parsed.error.flatten().fieldErrors,
      null,
      2
    )
  );

  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
