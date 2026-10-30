import { Request, Response, NextFunction } from 'express';
import { inquiryService } from '../services/inquiry.service';
import {
  CreateInquiryInput,
  ListInquiriesQueryInput,
  UpdateInquiryStatusInput,
} from '../validators/inquiry.validator';

export class InquiryController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateInquiryInput;
      const inquiry = await inquiryService.createInquiry(payload);

      res.status(201).json({
        success: true,
        message: 'Your inquiry has been submitted. Our team will review your message and get back to you.',
        data: { inquiry },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListInquiriesQueryInput;
      const result = await inquiryService.listInquiries({
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        search: query.search,
        category: query.category,
        user_type: query.user_type,
        status: query.status,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const inquiry = await inquiryService.getInquiryById(id);

      res.status(200).json({
        success: true,
        data: { inquiry },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateInquiryStatusInput;
      const inquiry = await inquiryService.updateInquiryStatus(id, status);

      res.status(200).json({
        success: true,
        message: `Inquiry status updated to "${status}"`,
        data: { inquiry },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inquiryController = new InquiryController();
