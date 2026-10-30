import React, { useState } from 'react';
import { X, Mail, Phone, Calendar, Clock, Check, Loader2 } from 'lucide-react';
import { Inquiry, InquiryStatus } from '../types';
import { StatusBadge, CategoryBadge, UserTypeBadge } from './StatusBadge';

interface InquiryDetailModalProps {
  inquiry: Inquiry | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: InquiryStatus) => Promise<void>;
}

const ALL_STATUSES: InquiryStatus[] = ['New', 'Contacted', 'In Progress', 'Resolved'];

export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiry,
  onClose,
  onUpdateStatus,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState<InquiryStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!inquiry) return null;

  const handleStatusClick = async (nextStatus: InquiryStatus) => {
    if (nextStatus === inquiry.status || updatingStatus) return;
    setUpdatingStatus(nextStatus);
    setErrorMessage(null);
    try {
      await onUpdateStatus(inquiry.id, nextStatus);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-[1px] transition-opacity">
      <div
        className="relative w-full max-w-lg bg-white h-full border-l border-canvas-border shadow-panel flex flex-col justify-between overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-inquiry-title"
      >
        <div>
          <div className="px-6 py-5 border-b border-canvas-border flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
            <div>
              <div className="flex items-center gap-2.5">
                <StatusBadge status={inquiry.status} />
                <span className="text-xs text-ink-muted">
                  Submitted{' '}
                  {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <h2
                id="drawer-inquiry-title"
                className="font-serif text-xl font-semibold text-ink mt-1.5"
              >
                {inquiry.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close inquiry details"
              className="p-1.5 rounded-md border border-canvas-border text-ink-muted hover:text-ink hover:bg-canvas-subtle transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-md bg-canvas-subtle border border-canvas-border">
              <div>
                <span className="block text-xs font-medium text-ink-muted">User Type</span>
                <div className="mt-1.5">
                  <UserTypeBadge userType={inquiry.user_type} />
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-ink-muted">Category</span>
                <div className="mt-1.5">
                  <CategoryBadge category={inquiry.category} />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-ink-secondary">Contact Information</h3>
              <div className="border border-canvas-border rounded-md divide-y divide-canvas-border text-sm">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-ink-muted">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="font-medium text-accent hover:underline break-all text-right"
                  >
                    {inquiry.email}
                  </a>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-ink-muted">
                    <Phone className="w-4 h-4" />
                    Phone
                  </span>
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="font-medium text-ink hover:text-accent"
                  >
                    {inquiry.phone}
                  </a>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-ink-muted">
                    <Calendar className="w-4 h-4" />
                    Created
                  </span>
                  <span className="text-ink-secondary">
                    {new Date(inquiry.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 text-ink-muted">
                    <Clock className="w-4 h-4" />
                    Last Updated
                  </span>
                  <span className="text-ink-secondary">
                    {new Date(inquiry.updated_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-ink-secondary">Message / Query</h3>
              <div className="p-4 rounded-md border border-canvas-border bg-canvas/50 text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-canvas-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-ink-secondary">Update Inquiry Status</h3>
                {updatingStatus && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-accent">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </span>
                )}
              </div>

              {errorMessage && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                {ALL_STATUSES.map((statusOption) => {
                  const isCurrent = inquiry.status === statusOption;
                  return (
                    <button
                      key={statusOption}
                      type="button"
                      disabled={Boolean(updatingStatus)}
                      onClick={() => void handleStatusClick(statusOption)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-md border text-sm font-medium transition-all ${
                        isCurrent
                          ? 'border-accent bg-accent-subtle text-accent ring-1 ring-accent'
                          : 'border-canvas-border bg-white text-ink-secondary hover:bg-canvas-subtle'
                      }`}
                    >
                      <span>{statusOption}</span>
                      {isCurrent && <Check className="w-4 h-4 text-accent" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-canvas-border bg-canvas-subtle flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-canvas-borderStrong bg-white text-sm font-medium text-ink hover:bg-canvas transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
