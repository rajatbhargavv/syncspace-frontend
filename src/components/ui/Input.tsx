import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      disabled,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = inputId && error ? `${inputId}-error` : undefined;
    const helperId = inputId && helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-text">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <span
              className="pointer-events-none absolute left-3 flex items-center text-text-muted"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId ?? helperId}
            className={cn(
              'w-full rounded-input border border-border bg-surface px-3.5 py-2 text-sm text-text transition-colors placeholder:text-text-muted',
              'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              error && 'border-error focus-visible:border-error focus-visible:ring-error',
              className,
            )}
            {...props}
          />
          {endIcon && (
            <span
              className="pointer-events-none absolute right-3 flex items-center text-text-muted"
              aria-hidden="true"
            >
              {endIcon}
            </span>
          )}
        </div>
        {error ? (
          <p id={errorId} className="mt-1 text-xs font-medium text-error">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 text-xs text-text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
