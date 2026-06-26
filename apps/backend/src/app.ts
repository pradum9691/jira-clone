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
 
  app.set('trust proxy', 1);

 
  app.use(helmet());

  
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );

  
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());

 
  app.use(mongoSanitize());

 
  app.use(pinoHttp({ logger }));

 
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', apiLimiter);

  
  app.use('/api/v1', apiRoutes);
 
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

