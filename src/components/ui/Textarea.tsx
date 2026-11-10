import React from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charCount?: number;
  maxChars?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, id, label, error, helperText, charCount, maxChars, disabled, rows = 3, ...props },
    ref,
  ) => {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = textareaId && error ? `${textareaId}-error` : undefined;
    const helperId = textareaId && helperText ? `${textareaId}-helper` : undefined;

    return (
      <div className="w-full">
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <label htmlFor={textareaId} className="block text-xs font-medium text-text">
              {label}
            </label>
          )}
          {maxChars !== undefined && (
            <span
              className={cn(
                'text-xs',
                (charCount ?? 0) > maxChars ? 'font-medium text-error' : 'text-text-muted',
              )}
            >
              {charCount ?? 0}/{maxChars}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId ?? helperId}
          className={cn(
            'min-h-[80px] w-full resize-y rounded-input border border-border bg-surface px-3.5 py-2 text-sm text-text transition-colors placeholder:text-text-muted',
            'focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus-visible:border-error focus-visible:ring-error',
            className,
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
