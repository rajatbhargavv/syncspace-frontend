import React from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variantStyles: Record<NonNullable<SkeletonProps['variant']>, string> = {
    rectangular: 'rounded-card',
    circular: 'rounded-full',
    text: 'rounded-sm h-4 my-1',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-hover/70 pointer-events-none animate-pulse select-none',
        variantStyles[variant],
        className,
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
