import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './shared/utils/logger';
import apiRoutes from './routes';
import {
  notFoundHandler,
  globalErrorHandler,
} from './middlewares/error-handler.middleware';

export function createApp(): Application {
  const app = express();

  // Reverse proxy support (Render, Railway, Nginx, etc.)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

  // NoSQL injection protection
  app.use(mongoSanitize());

  // Request logging
  app.use(pinoHttp({ logger }));

  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', apiLimiter);

  // API routes
  app.use('/api/v1', apiRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

