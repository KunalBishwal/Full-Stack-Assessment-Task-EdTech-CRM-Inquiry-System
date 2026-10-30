import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { LoginInput } from '../validators/auth.validator';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as LoginInput;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        message: 'Authenticated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin?.sub) {
        throw new AppError('Unauthorized request', 401);
      }
      const admin = await authService.getAuthenticatedAdmin(req.admin.sub);

      res.status(200).json({
        success: true,
        data: { admin },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
