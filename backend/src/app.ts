import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRouter from './routes';
import { generalApiLimiter } from './middleware/rateLimit.middleware';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  // Trust proxy for Render / reverse proxy accurate IP rate limiting
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // CORS configuration supporting single or comma-separated allowed origins
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        // In local development, allow localhost and 127.0.0.1 on any port
        if (
          env.NODE_ENV !== 'production' &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Request body parsing
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: true, limit: '64kb' }));

  // General API rate limit
  app.use('/api', generalApiLimiter);

  // Mount API routes
  app.use('/api', apiRouter);

  // 404 & centralized error handlers
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
