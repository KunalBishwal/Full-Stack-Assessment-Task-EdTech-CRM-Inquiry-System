import { Router } from 'express';
import authRouter from './auth.routes';
import inquiryRouter from './inquiry.routes';

const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'k12-hunar-api',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/inquiries', inquiryRouter);

export default apiRouter;
