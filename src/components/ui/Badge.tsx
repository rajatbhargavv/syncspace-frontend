import React from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-surface text-text border border-border',
    accent: 'bg-accent/15 text-accent border border-accent/30',
    success: 'bg-success/15 text-success border border-success/30',
    warning: 'bg-warning/15 text-warning border border-warning/30',
    error: 'bg-error/15 text-error border border-error/30',
    outline: 'bg-transparent text-text-muted border border-border',
  };

  const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
    sm: 'text-[10px] px-2 py-0.5 leading-tight',
    md: 'text-xs px-2.5 py-1 leading-tight',
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
