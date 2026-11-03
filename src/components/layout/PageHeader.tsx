import React from 'react';
import { cn } from '@/lib/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className,
}) => {
  return (
    <div
      className={cn(
        'border-border/60 flex flex-col gap-4 border-b py-6 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text">{title}</h1>
          {badge}
        </div>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
};