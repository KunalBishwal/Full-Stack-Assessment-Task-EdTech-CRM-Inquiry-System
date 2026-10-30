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

inquiryRouter.post(
  '/',
  publicInquiryLimiter,
  validateRequest(createInquirySchema),
  (req, res, next) => inquiryController.create(req, res, next)
);

inquiryRouter.get(
  '/',
  requireAdminAuth,
  validateRequest(listInquiriesSchema),
  (req, res, next) => inquiryController.list(req, res, next)
);

inquiryRouter.get(
  '/:id',
  requireAdminAuth,
  validateRequest(inquiryIdParamSchema),
  (req, res, next) => inquiryController.getById(req, res, next)
);

inquiryRouter.patch(
  '/:id/status',
  requireAdminAuth,
  validateRequest(updateInquiryStatusSchema),
  (req, res, next) => inquiryController.updateStatus(req, res, next)
);

export default inquiryRouter;
