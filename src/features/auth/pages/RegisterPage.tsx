import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/config/routes';
import { useRegister } from '../hooks/useRegister';
import {
  checkPasswordCriteria,
  nameRegex,
  registerSchema,
  type RegisterFormData,
} from '../schemas/auth.schema';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const watchedName = watch('name');
  const watchedPassword = watch('password');

  const nameLengthValid = watchedName.trim().length >= 3 && watchedName.trim().length <= 20;
  const nameCharsValid = watchedName.length > 0 && nameRegex.test(watchedName.trim());

  const passwordCriteria = checkPasswordCriteria(watchedPassword);

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(data);
      toast.success('Account created! Please sign in with your credentials.');
      navigate(ROUTES.LOGIN);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setFormError(message);
      toast.error(message);
    }
  };

  const isPending = isSubmitting || registerMutation.isPending;

  return (
    <div className="w-full rounded-card border border-border bg-surface p-8 shadow-elevated">
      <div className="mb-6 text-center">
        <h1 className="font-heading text-2xl font-bold text-text">Create your account</h1>
        <p className="mt-1 text-sm text-text-muted">Start organizing tasks and spaces</p>
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
        {/* Name input */}
        <div>
          <Input
            label="Full Name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            error={errors.name?.message}
            disabled={isPending}
            {...register('name')}
          />
          {/* Live Name requirements indicator */}
          <div className="mt-2 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  nameLengthValid ? 'bg-success' : 'bg-text-muted/40'
                }`}
              />
              <span className={nameLengthValid ? 'text-success' : 'text-text-muted'}>
                3-20 characters
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  nameCharsValid ? 'bg-success' : 'bg-text-muted/40'
                }`}
              />
              <span className={nameCharsValid ? 'text-success' : 'text-text-muted'}>
                Letters and spaces only
              </span>
            </div>
          </div>
        </div>

        {/* Email input */}
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          disabled={isPending}
          {...register('email')}
        />

        {/* Password input */}
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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

          {/* Live Password criteria checklist */}
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  passwordCriteria.minLength ? 'bg-success' : 'bg-text-muted/40'
                }`}
              />
              <span className={passwordCriteria.minLength ? 'text-success' : 'text-text-muted'}>
                7+ characters
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  passwordCriteria.hasUpper ? 'bg-success' : 'bg-text-muted/40'
                }`}
              />
              <span className={passwordCriteria.hasUpper ? 'text-success' : 'text-text-muted'}>
                Uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  passwordCriteria.hasLower ? 'bg-success' : 'bg-text-muted/40'
                }`}
              />
              <span className={passwordCriteria.hasLower ? 'text-success' : 'text-text-muted'}>
                Lowercase letter
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  passwordCriteria.hasNumber ? 'bg-success' : 'bg-text-muted/40'
                }`}
              />
              <span className={passwordCriteria.hasNumber ? 'text-success' : 'text-text-muted'}>
                One number
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  passwordCriteria.hasSpecial ? 'bg-success' : 'bg-text-muted/40'
                }`}
              />
              <span className={passwordCriteria.hasSpecial ? 'text-success' : 'text-text-muted'}>
                One special char (@#$%^&*!)
              </span>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          className="mt-4 w-full"
          isLoading={isPending}
          disabled={isPending}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-text-muted">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-accent hover:underline focus:outline-none"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
