import { Router } from 'express';
import authRouter from './auth.routes';
import inquiryRouter from './inquiry.routes';

import { dbQuery } from '../config/database';

const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  try {
    await dbQuery('SELECT 1');
    res.status(200).json({
      success: true,
      service: 'k12-hunar-api',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: 'k12-hunar-api',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Database ping failed',
      timestamp: new Date().toISOString(),
    });
  }
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/inquiries', inquiryRouter);

export default apiRouter;
