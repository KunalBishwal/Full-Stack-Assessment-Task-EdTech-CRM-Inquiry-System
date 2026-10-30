import { apiClient, tokenStorage } from './api';
import { AdminUser, ApiSuccessResponse, LoginResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiSuccessResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    const { token, admin } = response.data.data;
    tokenStorage.set(token);
    return { token, admin };
  },

  async getMe(): Promise<AdminUser> {
    const response = await apiClient.get<ApiSuccessResponse<{ admin: AdminUser }>>('/auth/me');
    return response.data.data.admin;
  },

  logout(): void {
    tokenStorage.clear();
  },
};
