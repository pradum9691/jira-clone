import pino from 'pino';
import { env } from '../../config/env';

/**
 * Centralized logger.
 *
 * - Development: pretty, colorized, human-readable output (pino-pretty)
 * - Production: structured JSON logs (easy to ship to log aggregators)
 *
 * Log levels used across the app: debug, info, warn, error.
 */
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
