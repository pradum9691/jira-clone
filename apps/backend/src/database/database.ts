import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../shared/utils/logger';

/**
 * Connects to MongoDB using the validated MONGO_URI.
 *
 * If the initial connection fails, the process exits because
 * the application cannot function without a database.
 */
export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  try {
    await mongoose.connect(env.MONGO_URI, {
      autoIndex: env.NODE_ENV !== 'production',
    });

    logger.info('MongoDB connected');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  }
}

/**
 * Gracefully closes the MongoDB connection.
 *
 * Called from the graceful shutdown handler in server.ts.
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
}
