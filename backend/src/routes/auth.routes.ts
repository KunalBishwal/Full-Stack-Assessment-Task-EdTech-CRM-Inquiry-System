import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAdminAuth } from '../middleware/auth.middleware';
import { authLoginLimiter } from '../middleware/rateLimit.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';

const authRouter = Router();

authRouter.post(
  '/login',
  authLoginLimiter,
  validateRequest(loginSchema),
  (req, res, next) => authController.login(req, res, next)
);

authRouter.get(
  '/me',
  requireAdminAuth,
  (req, res, next) => authController.me(req, res, next)
);

export default authRouter;
