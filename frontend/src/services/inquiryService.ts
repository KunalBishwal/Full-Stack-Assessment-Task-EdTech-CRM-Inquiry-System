import { apiClient } from './api';
import {
  ApiSuccessResponse,
  CreateInquiryPayload,
  Inquiry,
  InquiryFilters,
  InquiryStatus,
  PaginatedInquiriesResponse,
} from '../types';

export const inquiryService = {
  async submitPublicInquiry(payload: CreateInquiryPayload): Promise<{ inquiry: Inquiry; message: string }> {
    const response = await apiClient.post<ApiSuccessResponse<{ inquiry: Inquiry }>>(
      '/inquiries',
      payload
    );
    return {
      inquiry: response.data.data.inquiry,
      message: response.data.message || 'Inquiry submitted successfully.',
    };
  },

  async listInquiries(filters: InquiryFilters): Promise<PaginatedInquiriesResponse> {
    const params: Record<string, string | number> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.category) params.category = filters.category;
    if (filters.user_type) params.user_type = filters.user_type;
    if (filters.status) params.status = filters.status;

    const response = await apiClient.get<ApiSuccessResponse<PaginatedInquiriesResponse>>(
      '/inquiries',
      { params }
    );
    return response.data.data;
  },

  async getInquiryById(id: string): Promise<Inquiry> {
    const response = await apiClient.get<ApiSuccessResponse<{ inquiry: Inquiry }>>(
      `/inquiries/${id}`
    );
    return response.data.data.inquiry;
  },

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const response = await apiClient.patch<ApiSuccessResponse<{ inquiry: Inquiry }>>(
      `/inquiries/${id}/status`,
      { status }
    );
    return response.data.data.inquiry;
  },
};
