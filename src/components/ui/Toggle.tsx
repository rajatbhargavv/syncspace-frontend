import React from 'react';
import { cn } from '@/lib/cn';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled,
  className,
  id,
  ...props
}) => {
  const toggleId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={toggleId}
      className={cn(
        'inline-flex cursor-pointer select-none items-start gap-3',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div className="relative mt-0.5 inline-flex shrink-0 items-center">
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'h-6 w-11 rounded-full transition-colors focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2',
            checked ? 'bg-accent' : 'border border-border bg-surface-hover',
          )}
        >
          <div
            className={cn(
              'h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0.5',
              'relative top-0.5',
            )}
          />
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-text">{label}</span>}
          {description && <span className="mt-0.5 text-xs text-text-muted">{description}</span>}
        </div>
      )}
    </label>
  );
};