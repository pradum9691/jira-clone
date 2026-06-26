import http from 'http';

import { env } from './config/env';
import { createApp } from './app';
import {
  connectDatabase,
  disconnectDatabase,
} from './database/database';
import { logger } from './shared/utils/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(
      `Server running in ${env.NODE_ENV} mode on port ${env.PORT}`
    );
  });

  
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(async () => {
      try {
        await disconnectDatabase();

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (err) {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('uncaughtException', async (err) => {
    logger.fatal({ err }, 'Uncaught Exception');

    try {
      await disconnectDatabase();
    } finally {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', async (reason) => {
    logger.fatal({ reason }, 'Unhandled Rejection');

    server.close(async () => {
      try {
        await disconnectDatabase();
      } finally {
        process.exit(1);
      }
    });
  });
}

void bootstrap();

