import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'bg-error/5 border-error/20 flex flex-col items-center justify-center rounded-card border p-8 text-center',
        className,
      )}
    >
      <div className="bg-error/15 mb-4 flex h-12 w-12 items-center justify-center rounded-full text-error">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-text-muted">{message}</p>}
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
