import React from 'react';
import { cn } from '@/lib/cn';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      className,
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      'aria-label': ariaLabel,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:pointer-events-none rounded-button';

    const variantStyles: Record<NonNullable<IconButtonProps['variant']>, string> = {
      primary: 'bg-accent text-text-inverse hover:bg-accent-hover',
      secondary: 'bg-surface text-text hover:bg-surface-hover border border-border',
      outline: 'bg-transparent text-text hover:bg-surface border border-border hover:border-accent',
      ghost: 'bg-transparent text-text hover:bg-surface-hover',
      danger: 'bg-error text-white hover:opacity-90',
    };

    const sizeStyles: Record<NonNullable<IconButtonProps['size']>, string> = {
      sm: 'h-7 w-7 text-xs',
      md: 'h-9 w-9 text-sm',
      lg: 'h-11 w-11 text-base',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          children
        )}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
