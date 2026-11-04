import React, { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { IconButton } from './IconButton';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  className,
}) => {
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

  const sizeStyles: Record<NonNullable<DrawerProps['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const positionStyles: Record<NonNullable<DrawerProps['position']>, string> = {
    right: 'right-0 top-0 bottom-0 border-l',
    left: 'left-0 top-0 bottom-0 border-r',
  };

  return (
    <div className="z-modal fixed inset-0 flex">
      {/* Backdrop */}
      <div
        className="animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-sm duration-200"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'z-modal fixed flex h-full w-full flex-col overflow-y-auto border-border bg-surface p-6 shadow-elevated transition-transform',
          sizeStyles[size],
          positionStyles[position],
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <div className="mr-4 flex-1">
            {typeof title === 'string' ? (
              <h2 className="font-heading text-lg font-semibold text-text">{title}</h2>
            ) : (
              title
            )}
          </div>
          <IconButton
            aria-label="Close drawer"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0 text-text-muted hover:text-text"
          >
            <svg
              className="h-5 w-5"
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
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};