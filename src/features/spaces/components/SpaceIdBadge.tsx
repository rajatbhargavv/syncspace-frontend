import React, { useState } from 'react';
import { toast } from 'sonner';

export interface SpaceIdBadgeProps {
  spaceId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPrefix?: boolean;
}

export const SpaceIdBadge: React.FC<SpaceIdBadgeProps> = ({
  spaceId,
  size = 'md',
  className = '',
  showPrefix = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    void navigator.clipboard.writeText(spaceId);
    setCopied(true);
    toast.success('Space ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy Space ID (use to search this space)"
      aria-label={`Copy Space ID: ${spaceId}`}
      className={`border-border/80 bg-surface-hover/60 group inline-flex items-center rounded-full border font-mono font-medium text-text-muted transition-all duration-200 hover:border-accent hover:bg-surface-hover hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${sizeClasses} ${className}`}
    >
      {showPrefix && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent opacity-90">
          ID:
        </span>
      )}
      <span className="max-w-[200px] truncate sm:max-w-none">{spaceId}</span>
      {copied ? (
        <svg
          className="h-3 w-3 shrink-0 text-success"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
};
