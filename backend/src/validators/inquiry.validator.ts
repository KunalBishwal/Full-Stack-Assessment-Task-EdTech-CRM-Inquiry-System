import { z } from 'zod';
import { InquiryCategory, InquiryStatus, InquiryUserType } from '../types';

const normalizeUserType = (val: unknown): unknown => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim().toLowerCase();
  if (trimmed === 'parent') return 'Parent';
  if (trimmed === 'student') return 'Student';
  if (trimmed === 'school') return 'School';
  return val.trim();
};

const normalizeCategory = (val: unknown): unknown => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim().toLowerCase();
  if (trimmed === 'scholarship') return 'Scholarship';
  if (trimmed === 'concert') return 'Concert';
  if (trimmed === 'admission') return 'Admission';
  if (trimmed === 'general query' || trimmed === 'general') return 'General Query';
  return val.trim();
};

const normalizeStatus = (val: unknown): unknown => {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim().toLowerCase();
  if (trimmed === 'new') return 'New';
  if (trimmed === 'contacted') return 'Contacted';
  if (trimmed === 'in progress') return 'In Progress';
  if (trimmed === 'resolved') return 'Resolved';
  return val.trim();
};

export const userTypeEnum = z.preprocess(
  normalizeUserType,
  z.enum(['Parent', 'Student', 'School'], {
    errorMap: () => ({ message: 'User type must be Parent, Student, or School' }),
  })
) as z.ZodType<InquiryUserType>;

export const categoryEnum = z.preprocess(
  normalizeCategory,
  z.enum(['Scholarship', 'Concert', 'Admission', 'General Query'], {
    errorMap: () => ({
      message: 'Category must be Scholarship, Concert, Admission, or General Query',
    }),
  })
) as z.ZodType<InquiryCategory>;

export const statusEnum = z.preprocess(
  normalizeStatus,
  z.enum(['New', 'Contacted', 'In Progress', 'Resolved'], {
    errorMap: () => ({
      message: 'Status must be New, Contacted, In Progress, or Resolved',
    }),
  })
) as z.ZodType<InquiryStatus>;

export const createInquirySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(150, 'Name must not exceed 150 characters'),
    email: z
      .string({ required_error: 'Email address is required' })
      .trim()
      .email('Please provide a valid email address')
      .max(255)
      .transform((val) => val.toLowerCase()),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .regex(
        /^[+]?[0-9\s\-()]{7,20}$/,
        'Please enter a valid phone number (7–20 digits)'
      ),
    user_type: userTypeEnum,
    category: categoryEnum,
    message: z
      .string({ required_error: 'Inquiry message is required' })
      .trim()
      .min(10, 'Message must be at least 10 characters long')
      .max(3000, 'Message cannot exceed 3000 characters'),
  }),
});

export const listInquiriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    category: z.preprocess(
      (val) => (val === '' || val === 'All' || val === undefined ? undefined : normalizeCategory(val)),
      z.enum(['Scholarship', 'Concert', 'Admission', 'General Query']).optional()
    ),
    user_type: z.preprocess(
      (val) => (val === '' || val === 'All' || val === undefined ? undefined : normalizeUserType(val)),
      z.enum(['Parent', 'Student', 'School']).optional()
    ),
    status: z.preprocess(
      (val) => (val === '' || val === 'All' || val === undefined ? undefined : normalizeStatus(val)),
      z.enum(['New', 'Contacted', 'In Progress', 'Resolved']).optional()
    ),
  }),
});

export const inquiryIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid inquiry ID format'),
  }),
});

export const updateInquiryStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid inquiry ID format'),
  }),
  body: z.object({
    status: statusEnum,
  }),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>['body'];
export type ListInquiriesQueryInput = z.infer<typeof listInquiriesSchema>['query'];
export type UpdateInquiryStatusInput = z.infer<typeof updateInquiryStatusSchema>['body'];
