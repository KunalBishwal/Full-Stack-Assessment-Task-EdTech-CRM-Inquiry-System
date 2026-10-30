import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRouter from './routes';
import { generalApiLimiter } from './middleware/rateLimit.middleware';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());

  const allowedOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const normalized = origin.trim().replace(/\/+$/, '');

        if (
          allowedOrigins.includes('*') ||
          allowedOrigins.includes(normalized) ||
          allowedOrigins.some((ao) => ao === normalized)
        ) {
          callback(null, true);
          return;
        }

        if (
          normalized.endsWith('.vercel.app') ||
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)
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

  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: true, limit: '64kb' }));
  app.use('/api', generalApiLimiter);

  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      service: 'k12-hunar-backend',
      message: 'K12 Hunar EdTech CRM API is operational',
      version: '1.0.0',
      apiBase: '/api',
      health: '/api/health',
    });
  });

  app.use('/api', apiRouter);
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
