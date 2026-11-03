import React from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, id, label, error, helperText, options, disabled, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = selectId && error ? `${selectId}-error` : undefined;
    const helperId = selectId && helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-xs font-medium text-text">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId ?? helperId}
            className={cn(
              'w-full cursor-pointer appearance-none rounded-input border border-border bg-surface px-3.5 py-2 pr-9 text-sm text-text transition-colors',
              'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-error focus-visible:border-error focus-visible:ring-error',
              className,
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          >
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
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

Select.displayName = 'Select';