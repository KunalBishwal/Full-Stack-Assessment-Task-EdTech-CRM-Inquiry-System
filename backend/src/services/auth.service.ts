import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { adminRepository } from '../repositories/admin.repository';
import { AdminPublicProfile, AdminRecord, JwtAdminPayload } from '../types';
import { AppError } from '../middleware/error.middleware';

export class AuthService {
  private toPublicProfile(admin: AdminRecord): AdminPublicProfile {
    return {
      id: admin.id,
      email: admin.email,
      created_at: new Date(admin.created_at).toISOString(),
      last_login_at: admin.last_login_at ? new Date(admin.last_login_at).toISOString() : null,
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; admin: AdminPublicProfile }> {
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const updatedAdmin = (await adminRepository.updateLastLogin(admin.id)) ?? admin;

    const payload: JwtAdminPayload = {
      sub: updatedAdmin.id,
      email: updatedAdmin.email,
      role: 'admin',
    };

    const signOptions: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
      issuer: 'k12-hunar-crm',
    };

    const token = jwt.sign(payload, env.JWT_SECRET, signOptions);

    return {
      token,
      admin: this.toPublicProfile(updatedAdmin),
    };
  }

  async getAuthenticatedAdmin(adminId: string): Promise<AdminPublicProfile> {
    const admin = await adminRepository.findById(adminId);
    if (!admin) {
      throw new AppError('Administrator account not found', 401);
    }
    return this.toPublicProfile(admin);
  }

  verifyToken(token: string): JwtAdminPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'k12-hunar-crm',
      }) as JwtAdminPayload;
      if (!decoded || decoded.role !== 'admin' || !decoded.sub) {
        throw new AppError('Invalid authentication token payload', 401);
      }
      return decoded;
    } catch {
      throw new AppError('Invalid or expired authentication token', 401);
    }
  }
}

export const authService = new AuthService();
