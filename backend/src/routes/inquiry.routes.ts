import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller';
import { requireAdminAuth } from '../middleware/auth.middleware';
import { publicInquiryLimiter } from '../middleware/rateLimit.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createInquirySchema,
  inquiryIdParamSchema,
  listInquiriesSchema,
  updateInquiryStatusSchema,
} from '../validators/inquiry.validator';

const inquiryRouter = Router();

/**
 * POST /api/inquiries
 * Public endpoint: Submit a new inquiry without authentication.
 */
inquiryRouter.post(
  '/',
  publicInquiryLimiter,
  validateRequest(createInquirySchema),
  (req, res, next) => inquiryController.create(req, res, next)
);

/**
 * GET /api/inquiries
 * Protected Admin endpoint: List inquiries with server-side search, filters, and pagination.
 */
inquiryRouter.get(
  '/',
  requireAdminAuth,
  validateRequest(listInquiriesSchema),
  (req, res, next) => inquiryController.list(req, res, next)
);

/**
 * GET /api/inquiries/:id
 * Protected Admin endpoint: Get a single inquiry by ID.
 */
inquiryRouter.get(
  '/:id',
  requireAdminAuth,
  validateRequest(inquiryIdParamSchema),
  (req, res, next) => inquiryController.getById(req, res, next)
);

/**
 * PATCH /api/inquiries/:id/status
 * Protected Admin endpoint: Update inquiry status (New, Contacted, In Progress, Resolved).
 */
inquiryRouter.patch(
  '/:id/status',
  requireAdminAuth,
  validateRequest(updateInquiryStatusSchema),
  (req, res, next) => inquiryController.updateStatus(req, res, next)
);

export default inquiryRouter;
