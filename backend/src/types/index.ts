export type InquiryUserType = 'Parent' | 'Student' | 'School';

export type InquiryCategory = 'Scholarship' | 'Concert' | 'Admission' | 'General Query';

export type InquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Resolved';

export interface AdminRecord {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  last_login_at: Date | null;
}

export interface AdminPublicProfile {
  id: string;
  email: string;
  created_at: string;
  last_login_at: string | null;
}

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_type: InquiryUserType;
  category: InquiryCategory;
  message: string;
  status: InquiryStatus;
  created_at: Date;
  updated_at: Date;
}

export interface InquiryListQuery {
  page: number;
  limit: number;
  search?: string;
  category?: InquiryCategory;
  user_type?: InquiryUserType;
  status?: InquiryStatus;
}

export interface InquirySummaryCounts {
  total: number;
  new_count: number;
  contacted_count: number;
  in_progress_count: number;
  resolved_count: number;
}

export interface PaginatedInquiriesResult {
  items: InquiryRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: InquirySummaryCounts;
}

export interface JwtAdminPayload {
  sub: string;
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      admin?: JwtAdminPayload;
    }
  }
}
