import { AppError } from '../middleware/error.middleware';
import { inquiryRepository } from '../repositories/inquiry.repository';
import {
  InquiryListQuery,
  InquiryRecord,
  InquiryStatus,
  PaginatedInquiriesResult,
} from '../types';
import { CreateInquiryInput } from '../validators/inquiry.validator';

export class InquiryService {
  async createInquiry(input: CreateInquiryInput): Promise<InquiryRecord> {
    return inquiryRepository.create(input);
  }

  async listInquiries(query: InquiryListQuery): Promise<PaginatedInquiriesResult> {
    return inquiryRepository.listPaginated(query);
  }

  async getInquiryById(id: string): Promise<InquiryRecord> {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) {
      throw new AppError('Inquiry not found', 404);
    }
    return inquiry;
  }

  async updateInquiryStatus(id: string, status: InquiryStatus): Promise<InquiryRecord> {
    const updated = await inquiryRepository.updateStatus(id, status);
    if (!updated) {
      throw new AppError('Inquiry not found', 404);
    }
    return updated;
  }
}

export const inquiryService = new InquiryService();
