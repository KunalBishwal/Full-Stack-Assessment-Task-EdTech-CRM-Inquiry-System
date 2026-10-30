import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b border-canvas-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-md bg-ink text-white flex items-center justify-center transition-colors group-hover:bg-accent">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-lg font-semibold tracking-tight text-ink block leading-tight">
              K12 Hunar
            </span>
            <span className="text-xs text-ink-muted block">
              Student, Parent & School Inquiry Portal
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-secondary">
          <a href="#categories" className="hover:text-ink transition-colors">
            Inquiry Categories
          </a>
          <a href="#inquiry-form" className="hover:text-ink transition-colors font-medium text-ink">
            Submit an Inquiry
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-canvas-borderStrong bg-white text-xs sm:text-sm font-medium text-ink-secondary hover:text-ink hover:border-ink/40 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
