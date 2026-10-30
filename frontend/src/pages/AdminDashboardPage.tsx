import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ExternalLink,
  Inbox,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { inquiryService } from '../services/inquiryService';
import { extractApiErrorMessage } from '../services/api';
import {
  Inquiry,
  InquiryCategory,
  InquiryStatus,
  InquirySummaryCounts,
  InquiryUserType,
} from '../types';
import { StatusBadge, CategoryBadge, UserTypeBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { InquiryDetailModal } from '../components/InquiryDetailModal';

const CATEGORIES: InquiryCategory[] = ['Scholarship', 'Concert', 'Admission', 'General Query'];
const USER_TYPES: InquiryUserType[] = ['Parent', 'Student', 'School'];
const STATUSES: InquiryStatus[] = ['New', 'Contacted', 'In Progress', 'Resolved'];

export const AdminDashboardPage: React.FC = () => {
  const { admin, logout } = useAuth();

  // Filter & pagination state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [categoryFilter, setCategoryFilter] = useState<InquiryCategory | ''>('');
  const [userTypeFilter, setUserTypeFilter] = useState<InquiryUserType | ''>('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Data state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState<InquirySummaryCounts>({
    total: 0,
    new_count: 0,
    contacted_count: 0,
    in_progress_count: 0,
    resolved_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [updatingRowId, setUpdatingRowId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inquiryService.listInquiries({
        page,
        limit,
        search: debouncedSearch,
        category: categoryFilter,
        user_type: userTypeFilter,
        status: statusFilter,
      });
      setInquiries(response.items);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setSummary(response.summary);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, categoryFilter, userTypeFilter, statusFilter]);

  useEffect(() => {
    void fetchInquiries();
  }, [fetchInquiries]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, userTypeFilter, statusFilter]);

  const handleStatusUpdate = async (id: string, nextStatus: InquiryStatus) => {
    setUpdatingRowId(id);
    try {
      const updated = await inquiryService.updateInquiryStatus(id, nextStatus);
      setSelectedInquiry((prev) => (prev && prev.id === id ? updated : prev));
      await fetchInquiries();
    } finally {
      setUpdatingRowId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setCategoryFilter('');
    setUserTypeFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchInput.trim() || categoryFilter || userTypeFilter || statusFilter
  );

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Compact Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r border-canvas-border justify-between shrink-0">
        <div className="p-5 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-canvas-border">
            <div className="w-8 h-8 rounded-md bg-ink text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-base font-semibold text-ink block leading-tight">
                K12 Hunar
              </span>
              <span className="text-xs text-ink-muted block">
                Admin CRM
              </span>
            </div>
          </div>

          {/* Status Filter Navigation */}
          <div className="space-y-1">
            <p className="px-2.5 text-xs font-semibold text-ink-muted mb-2">
              Inquiries by Status
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-canvas-subtle text-ink font-semibold'
                  : 'text-ink-secondary hover:bg-canvas'
              }`}
            >
              <span>All Inquiries</span>
              <span className="text-xs font-medium text-ink-muted">{summary.total}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('New')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'New'
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-ink-secondary hover:bg-canvas'
              }`}
            >
              <span>New</span>
              <span className="text-xs font-medium text-blue-700">{summary.new_count}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Contacted')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'Contacted'
                  ? 'bg-amber-50 text-amber-900 font-semibold'
                  : 'text-ink-secondary hover:bg-canvas'
              }`}
            >
              <span>Contacted</span>
              <span className="text-xs font-medium text-amber-700">
                {summary.contacted_count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('In Progress')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'In Progress'
                  ? 'bg-indigo-50 text-indigo-900 font-semibold'
                  : 'text-ink-secondary hover:bg-canvas'
              }`}
            >
              <span>In Progress</span>
              <span className="text-xs font-medium text-indigo-700">
                {summary.in_progress_count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Resolved')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === 'Resolved'
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-ink-secondary hover:bg-canvas'
              }`}
            >
              <span>Resolved</span>
              <span className="text-xs font-medium text-emerald-700">
                {summary.resolved_count}
              </span>
            </button>
          </div>

          {/* Quick Category Filter */}
          <div className="space-y-1 pt-4 border-t border-canvas-border">
            <p className="px-2.5 text-xs font-semibold text-ink-muted mb-2">
              Categories
            </p>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                  categoryFilter === cat
                    ? 'bg-accent-subtle text-accent font-medium'
                    : 'text-ink-secondary hover:bg-canvas'
                }`}
              >
                <span>{cat}</span>
                {categoryFilter === cat && <X className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Admin Profile & Logout */}
        <div className="p-4 border-t border-canvas-border bg-canvas-subtle/60 space-y-3">
          <div className="text-xs">
            <span className="text-ink-muted block">Signed in as</span>
            <span className="font-medium text-sm text-ink truncate block mt-0.5">
              {admin?.email || 'admin@k12hunar.edu.in'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md border border-canvas-border bg-white text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
            >
              Public Site
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-canvas-border px-4 sm:px-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-xl font-semibold text-ink">
              Inquiries Dashboard
            </h1>
            <p className="text-xs text-ink-muted hidden sm:block">
              View, search, filter, and manage submitted inquiries
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void fetchInquiries()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-canvas-border bg-white text-xs sm:text-sm font-medium text-ink-secondary hover:text-ink hover:bg-canvas-subtle transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <Link
              to="/"
              className="lg:hidden inline-flex items-center gap-1 px-3 py-2 rounded-md border border-canvas-border bg-white text-xs font-medium text-ink-secondary"
            >
              Public Site
            </Link>

            <button
              type="button"
              onClick={logout}
              className="lg:hidden inline-flex items-center gap-1 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-xs font-medium text-red-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Overview Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white border border-canvas-border rounded-lg p-4">
              <span className="text-xs font-medium text-ink-muted">Total Inquiries</span>
              <p className="font-serif text-2xl font-semibold text-ink mt-1">{summary.total}</p>
            </div>
            <div className="bg-white border border-canvas-border rounded-lg p-4">
              <span className="text-xs font-medium text-blue-700">New</span>
              <p className="font-serif text-2xl font-semibold text-ink mt-1">
                {summary.new_count}
              </p>
            </div>
            <div className="bg-white border border-canvas-border rounded-lg p-4">
              <span className="text-xs font-medium text-amber-700">Contacted</span>
              <p className="font-serif text-2xl font-semibold text-ink mt-1">
                {summary.contacted_count}
              </p>
            </div>
            <div className="bg-white border border-canvas-border rounded-lg p-4">
              <span className="text-xs font-medium text-indigo-700">In Progress</span>
              <p className="font-serif text-2xl font-semibold text-ink mt-1">
                {summary.in_progress_count}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white border border-canvas-border rounded-lg p-4">
              <span className="text-xs font-medium text-emerald-700">Resolved</span>
              <p className="font-serif text-2xl font-semibold text-ink mt-1">
                {summary.resolved_count}
              </p>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white border border-canvas-border rounded-lg p-4 shadow-editorial space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search by Name or Phone */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or phone number..."
                  aria-label="Search inquiries by name or phone number"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-canvas/40 border border-canvas-borderStrong rounded-md focus:outline-none focus:bg-white focus:border-accent"
                />
              </div>

              {/* Filter by Category */}
              <div className="md:col-span-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as InquiryCategory | '')}
                  aria-label="Filter by category"
                  className="w-full px-3 py-2 text-sm bg-canvas/40 border border-canvas-borderStrong rounded-md focus:outline-none focus:bg-white focus:border-accent"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by User Type */}
              <div className="md:col-span-2">
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value as InquiryUserType | '')}
                  aria-label="Filter by user type"
                  className="w-full px-3 py-2 text-sm bg-canvas/40 border border-canvas-borderStrong rounded-md focus:outline-none focus:bg-white focus:border-accent"
                >
                  <option value="">All User Types</option>
                  {USER_TYPES.map((ut) => (
                    <option key={ut} value={ut}>
                      {ut}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div className="md:col-span-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | '')}
                  aria-label="Filter by status"
                  className="w-full px-3 py-2 text-sm bg-canvas/40 border border-canvas-borderStrong rounded-md focus:outline-none focus:bg-white focus:border-accent"
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-canvas-border text-xs">
                <div className="flex items-center gap-2 text-ink-muted">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters applied</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-accent hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div
              role="alert"
              className="p-4 rounded-md bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-sm text-red-800"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => void fetchInquiries()}
                className="px-3 py-1 rounded bg-white border border-red-200 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Tabular View: Name, Phone, Email, User Type, Category, Date, Status */}
          <div className="bg-white border border-canvas-border rounded-lg shadow-editorial overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-canvas-subtle border-b border-canvas-border text-xs font-semibold text-ink-secondary">
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">User Type</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-border text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-ink-muted">
                        <div className="inline-flex items-center gap-2 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                          Loading inquiries...
                        </div>
                      </td>
                    </tr>
                  ) : inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Inbox className="w-7 h-7 text-ink-faint mx-auto" />
                          <p className="text-sm font-medium text-ink">
                            {hasActiveFilters ? 'No matching inquiries' : 'No inquiries submitted yet'}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {hasActiveFilters
                              ? 'Try adjusting your search term or clearing the selected filters.'
                              : 'New inquiries submitted through the public form will appear here.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inquiry) => (
                      <tr
                        key={inquiry.id}
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="hover:bg-canvas/60 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-medium text-ink whitespace-nowrap">
                          {inquiry.name}
                        </td>
                        <td className="py-3.5 px-4 text-ink-secondary whitespace-nowrap">
                          {inquiry.phone}
                        </td>
                        <td className="py-3.5 px-4 text-ink-secondary whitespace-nowrap">
                          {inquiry.email}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <UserTypeBadge userType={inquiry.user_type} />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <CategoryBadge category={inquiry.category} />
                        </td>
                        <td className="py-3.5 px-4 text-ink-muted whitespace-nowrap">
                          {new Date(inquiry.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td
                          className="py-3.5 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-2">
                            <StatusBadge status={inquiry.status} />
                            <select
                              aria-label={`Change status for ${inquiry.name}`}
                              value={inquiry.status}
                              disabled={updatingRowId === inquiry.id}
                              onChange={(e) =>
                                void handleStatusUpdate(
                                  inquiry.id,
                                  e.target.value as InquiryStatus
                                )
                              }
                              className="text-xs border border-canvas-border rounded px-2 py-1 bg-white text-ink-secondary hover:border-canvas-borderStrong focus:outline-none focus:border-accent"
                            >
                              {STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInquiry(inquiry);
                            }}
                            className="inline-flex items-center px-3 py-1.5 rounded-md border border-canvas-border bg-white text-xs font-medium text-ink-secondary hover:text-ink hover:border-ink/40 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              limit={limit}
              onPageChange={(nextPage) => setPage(nextPage)}
            />
          </div>
        </main>
      </div>

      {/* Inquiry Details & Status Modal */}
      <InquiryDetailModal
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onUpdateStatus={handleStatusUpdate}
      />
    </div>
  );
};
