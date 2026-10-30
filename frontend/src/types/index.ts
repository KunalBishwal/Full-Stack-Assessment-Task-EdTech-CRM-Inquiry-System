export type InquiryUserType = 'Parent' | 'Student' | 'School';

export type InquiryCategory = 'Scholarship' | 'Concert' | 'Admission' | 'General Query';

export type InquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Resolved';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_type: InquiryUserType;
  category: InquiryCategory;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateInquiryPayload {
  name: string;
  email: string;
  phone: string;
  user_type: InquiryUserType;
  category: InquiryCategory;
  message: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface InquiryFilters {
  page: number;
  limit: number;
  search?: string;
  category?: InquiryCategory | '';
  user_type?: InquiryUserType | '';
  status?: InquiryStatus | '';
}

export interface InquirySummaryCounts {
  total: number;
  new_count: number;
  contacted_count: number;
  in_progress_count: number;
  resolved_count: number;
}

export interface PaginatedInquiriesResponse {
  items: Inquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: InquirySummaryCounts;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
