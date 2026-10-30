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

  // CORS configuration supporting single or comma-separated allowed origins (stripping trailing slashes)
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

        // Allow wildcard or explicit origin match (ignoring trailing slash differences)
        if (
          allowedOrigins.includes('*') ||
          allowedOrigins.includes(normalized) ||
          allowedOrigins.some((ao) => ao === normalized)
        ) {
          callback(null, true);
          return;
        }

        // Automatically allow any Vercel app domain or local development ports
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

  // Request body parsing
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: true, limit: '64kb' }));

  // General API rate limit
  app.use('/api', generalApiLimiter);

  // Root health & status indicator
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

  // Mount API routes
  app.use('/api', apiRouter);

  // 404 & centralized error handlers
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
