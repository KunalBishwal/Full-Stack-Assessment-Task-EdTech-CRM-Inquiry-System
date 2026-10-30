import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-canvas-subtle border-t border-canvas-border mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-canvas-border">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-ink text-white flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif text-base font-semibold text-ink">
                K12 Hunar
              </span>
            </div>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Centralized inquiry and support portal for K–12 parents, students, and partner
              schools across scholarships, concerts, admissions, and general queries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-ink-secondary">
            <a href="#categories" className="hover:text-ink transition-colors">
              Inquiry Categories
            </a>
            <a href="#inquiry-form" className="hover:text-ink transition-colors">
              Submit Inquiry
            </a>
            <Link to="/admin/login" className="hover:text-ink transition-colors font-medium text-ink">
              Admin Login
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} K12 Hunar. All rights reserved.</p>
          <p>EdTech CRM & Inquiry Management System</p>
        </div>
      </div>
    </footer>
  );
};
