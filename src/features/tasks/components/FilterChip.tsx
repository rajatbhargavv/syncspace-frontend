import React from 'react';
import { cn } from '@/lib/cn';

export interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active = false,
  onClick,
  onRemove,
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
      active
        ? 'bg-accent/15 border-accent text-accent'
        : 'border-border bg-surface text-text-muted hover:border-accent hover:text-text',
    )}
  >
    {label}
    {onRemove && (
      <span
        role="button"
        tabIndex={0}
        aria-label={`Remove ${label} filter`}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            onRemove();
          }
        }}
      >
        ×
      </span>
    )}
  </button>
);
