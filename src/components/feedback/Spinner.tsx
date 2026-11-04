import React from 'react';
import { cn } from '@/lib/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label = 'Loading...',
  className,
  ...props
}) => {
  const sizeStyles: Record<NonNullable<SpinnerProps['size']>, string> = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center text-accent', className)}
      {...props}
    >
      <span
        className={cn(
          'animate-spin rounded-full border-current border-t-transparent',
          sizeStyles[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};