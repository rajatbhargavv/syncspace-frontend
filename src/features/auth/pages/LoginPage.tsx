import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { useLogin } from '../hooks/useLogin';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';

interface LocationState {
  from?: {
    pathname: string;
    search?: string;
  };
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetchUser } = useAuth();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormError(null);
    try {
      await loginMutation.mutateAsync(data);
      await refetchUser();
      toast.success('Welcome back!');
      const state = location.state as LocationState | null;
      const destination = state?.from
        ? `${state.from.pathname}${state.from.search ?? ''}`
        : ROUTES.OVERVIEW;
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setFormError(message);
      toast.error(message);
    }
  };

  const isPending = isSubmitting || loginMutation.isPending;

  return (
    <div className="w-full rounded-card border border-border bg-surface p-8 shadow-elevated">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-text">Welcome back</h1>
        <p className="mt-1 text-sm text-text-muted">Sign in to your SyncSpace account</p>
      </div>

      {formError && (
        <div
          role="alert"
          className="bg-error/10 border-error/20 mb-5 rounded-input border p-3 text-xs font-medium text-error"
        >
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          disabled={isPending}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={isPending}
            {...register('password')}
            endIcon={
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="pointer-events-auto text-text-muted hover:text-text focus:outline-none"
              >
                {showPassword ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            }
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="mt-2 w-full"
          isLoading={isPending}
          disabled={isPending}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-text-muted">
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-accent hover:underline focus:outline-none"
        >
          Create account
        </Link>
      </div>
    </div>
  );
};
