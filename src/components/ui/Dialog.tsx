import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeStyles: Record<NonNullable<DialogProps['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="z-modal fixed inset-0 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-sm duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Dialog content */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
        aria-describedby={description ? 'dialog-description' : undefined}
        className={cn(
          'z-modal relative w-full rounded-card border border-border bg-surface p-6 shadow-elevated transition-all',
          sizeStyles[size],
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 id="dialog-title" className="font-heading text-lg font-semibold text-text">
                {title}
              </h2>
            )}
            {description && (
              <p id="dialog-description" className="mt-1 text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
          <IconButton
            aria-label="Close dialog"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="-mr-2 -mt-2 shrink-0 text-text-muted hover:text-text"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
