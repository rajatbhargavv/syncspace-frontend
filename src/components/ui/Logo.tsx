import React from 'react';
import { cn } from '@/lib/cn';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className,
  ...props
}) => {
  const sizeStyles: Record<NonNullable<LogoProps['size']>, { icon: string; text: string }> = {
    sm: { icon: 'h-6 w-6', text: 'text-base font-bold' },
    md: { icon: 'h-8 w-8', text: 'text-xl font-bold' },
    lg: { icon: 'h-10 w-10', text: 'text-2xl font-bold' },
  };

  return (
    <div className={cn('inline-flex select-none items-center gap-2.5', className)} {...props}>
      <div
        className={cn('relative flex shrink-0 items-center justify-center', sizeStyles[size].icon)}
      >
        {/* Ring */}
        <div className="border-accent/80 h-full w-full rounded-full border-2" />
        {/* Orbiting dot */}
        <div className="absolute -right-0.5 -top-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-bg" />
        {/* Central core */}
        <div className="bg-accent/40 absolute h-2 w-2 rounded-full" />
      </div>
      {showText && (
        <span className={cn('font-heading tracking-tight text-text', sizeStyles[size].text)}>
          Sync<span className="text-accent">Space</span>
        </span>
      )}
    </div>
  );
};