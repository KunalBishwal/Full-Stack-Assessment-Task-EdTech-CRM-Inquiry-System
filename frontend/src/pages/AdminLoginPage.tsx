import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { extractApiErrorMessage } from '../services/api';

const loginFormSchema = z.object({
  email: z.string().trim().email('Please enter a valid admin email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (values: LoginFormValues) => {
    setAuthError(null);
    try {
      await login(values.email, values.password);
      const destination =
        (location.state as { from?: { pathname?: string } })?.from?.pathname ||
        '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (error) {
      setAuthError(extractApiErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inquiry Form
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-12">
        <div className="bg-white border border-canvas-border rounded-lg p-6 sm:p-8 shadow-editorial space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-ink text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold text-ink">
                Admin Login
              </h1>
              <p className="text-sm text-ink-secondary mt-1">
                Sign in with your administrator credentials to view and manage inquiries.
              </p>
            </div>
          </div>

          {authError && (
            <div
              role="alert"
              className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-800"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-sm font-medium text-ink">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@k12hunar.edu.in"
                {...register('email')}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                {...register('password')}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-canvas-borderStrong rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-ink hover:bg-accent text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto text-center text-xs text-ink-muted">
        K12 Hunar Admin CRM
      </div>
    </div>
  );
};
