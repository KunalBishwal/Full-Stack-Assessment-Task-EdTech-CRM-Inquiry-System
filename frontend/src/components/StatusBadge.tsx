import React from 'react';
import { InquiryStatus, InquiryCategory, InquiryUserType } from '../types';

const STATUS_STYLES: Record<
  InquiryStatus,
  { wrapper: string; dot: string }
> = {
  New: {
    wrapper: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-600',
  },
  Contacted: {
    wrapper: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-600',
  },
  'In Progress': {
    wrapper: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-600',
  },
  Resolved: {
    wrapper: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
};

export const StatusBadge: React.FC<{ status: InquiryStatus }> = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.New;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.wrapper}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

const CATEGORY_STYLES: Record<InquiryCategory, string> = {
  Scholarship: 'bg-stone-100 text-stone-800 border-stone-300',
  Concert: 'bg-amber-50/70 text-amber-900 border-amber-200/80',
  Admission: 'bg-blue-50/70 text-blue-900 border-blue-200/80',
  'General Query': 'bg-slate-100 text-slate-700 border-slate-200',
};

export const CategoryBadge: React.FC<{ category: InquiryCategory }> = ({ category }) => {
  const classes = CATEGORY_STYLES[category] || CATEGORY_STYLES['General Query'];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}>
      {category}
    </span>
  );
};

export const UserTypeBadge: React.FC<{ userType: InquiryUserType }> = ({ userType }) => {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-canvas-subtle text-ink-secondary border border-canvas-border">
      {userType}
    </span>
  );
};
