import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, AlertCircle, Loader2, Send, RotateCcw } from 'lucide-react';
import { inquiryService } from '../services/inquiryService';
import { extractApiErrorMessage } from '../services/api';
import { Inquiry, InquiryCategory } from '../types';

const USER_TYPES = ['Parent', 'Student', 'School'] as const;
const CATEGORIES = ['Scholarship', 'Concert', 'Admission', 'General Query'] as const;

const inquiryFormSchema = z.object({
  user_type: z.enum(USER_TYPES, {
    errorMap: () => ({ message: 'Please select whether you are a Parent, Student, or School' }),
  }),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select an inquiry category' }),
  }),
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters)')
    .max(150, 'Name cannot exceed 150 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email cannot exceed 255 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number (7–20 digits)'),
  message: z
    .string()
    .trim()
    .min(10, 'Please enter at least 10 characters describing your query')
    .max(3000, 'Message cannot exceed 3000 characters'),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

interface InquiryFormProps {
  selectedCategory?: InquiryCategory | '';
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ selectedCategory = '' }) => {
  const [submittedRecord, setSubmittedRecord] = useState<Inquiry | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues: {
      user_type: undefined,
      category: (selectedCategory as InquiryCategory) || undefined,
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  useEffect(() => {
    if (selectedCategory) {
      setValue('category', selectedCategory as InquiryCategory, { shouldValidate: true });
    }
  }, [selectedCategory, setValue]);

  const onSubmit = async (values: InquiryFormValues) => {
    setServerError(null);
    try {
      const response = await inquiryService.submitPublicInquiry({
        name: values.name,
        email: values.email,
        phone: values.phone,
        user_type: values.user_type,
        category: values.category,
        message: values.message,
      });
      setSubmittedRecord(response.inquiry);
    } catch (error) {
      setServerError(extractApiErrorMessage(error));
    }
  };

  const handleReset = () => {
    setSubmittedRecord(null);
    setServerError(null);
    reset({
      user_type: undefined,
      category: undefined,
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  if (submittedRecord) {
    return (
      <div className="bg-white border border-canvas-border rounded-lg p-6 sm:p-8 shadow-editorial">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                Inquiry Submitted
              </span>
              <h3 className="font-serif text-xl font-semibold text-ink mt-2">
                Thank you, {submittedRecord.name}.
              </h3>
              <p className="text-sm text-ink-secondary leading-relaxed mt-1">
                We have received your inquiry and saved your details. Our team will review your
                message and reach out via{' '}
                <span className="font-medium text-ink">{submittedRecord.email}</span> or{' '}
                <span className="font-medium text-ink">{submittedRecord.phone}</span>.
              </p>
            </div>

            <div className="p-4 rounded-md bg-canvas-subtle border border-canvas-border text-sm space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-ink-muted">User Type</span>
                <span className="font-medium text-ink">{submittedRecord.user_type}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ink-muted">Category</span>
                <span className="font-medium text-ink">{submittedRecord.category}</span>
              </div>
              <div className="pt-2 border-t border-canvas-border">
                <span className="text-ink-muted block text-xs mb-1">Your Message</span>
                <p className="text-ink-secondary whitespace-pre-wrap">{submittedRecord.message}</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-canvas-borderStrong bg-white text-sm font-medium text-ink hover:bg-canvas-subtle transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Submit Another Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="bg-white border border-canvas-border rounded-lg p-6 sm:p-8 shadow-editorial space-y-5"
    >
      <div className="border-b border-canvas-border pb-4">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Submit an Inquiry
        </h2>
        <p className="text-sm text-ink-secondary mt-1">
          Fill out the form below to send a question or request to the K12 Hunar team.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Could not submit your inquiry</p>
            <p className="text-xs mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="inquiry-user-type" className="block text-sm font-medium text-ink">
            User Type <span className="text-red-600">*</span>
          </label>
          <select
            id="inquiry-user-type"
            {...register('user_type')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          >
            <option value="" disabled>
              Select user type...
            </option>
            {USER_TYPES.map((ut) => (
              <option key={ut} value={ut}>
                {ut}
              </option>
            ))}
          </select>
          {errors.user_type && (
            <p className="text-xs text-red-600">{errors.user_type.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inquiry-category" className="block text-sm font-medium text-ink">
            Category <span className="text-red-600">*</span>
          </label>
          <select
            id="inquiry-category"
            {...register('category')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          >
            <option value="" disabled>
              Select category...
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-red-600">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="inquiry-name" className="block text-sm font-medium text-ink">
          Full Name <span className="text-red-600">*</span>
        </label>
        <input
          id="inquiry-name"
          type="text"
          placeholder="Enter your full name"
          {...register('name')}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="inquiry-email" className="block text-sm font-medium text-ink">
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            id="inquiry-email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="inquiry-phone" className="block text-sm font-medium text-ink">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            placeholder="+91 98765 43210"
            {...register('phone')}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="inquiry-message" className="block text-sm font-medium text-ink">
          Message / Query <span className="text-red-600">*</span>
        </label>
        <textarea
          id="inquiry-message"
          rows={4}
          placeholder="How can we help you? Please include any relevant details."
          {...register('message')}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-y"
        />
        {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-ink-muted">
          All fields marked with <span className="text-red-600">*</span> are required.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Inquiry
            </>
          )}
        </button>
      </div>
    </form>
  );
};
