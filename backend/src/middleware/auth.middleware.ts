import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from './error.middleware';

export function requireAdminAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a Bearer token.', 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError('Authentication token is missing.', 401);
    }

    const payload = authService.verifyToken(token);
    req.admin = payload;
    next();
  } catch (error) {
    next(error);
  }
}
