import React, { useState, type KeyboardEvent, type ClipboardEvent } from 'react';
import { cn } from '@/lib/cn';

export interface TagInputProps {
  id?: string;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: string[];
  onChange?: (tags: string[]) => void;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  id,
  label,
  error,
  helperText,
  placeholder = 'Add a tag...',
  value = [],
  onChange,
  disabled = false,
  className,
  maxTags = 10,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : 'tag-input');
  const errorId = inputId && error ? `${inputId}-error` : undefined;
  const helperId = inputId && helperText ? `${inputId}-helper` : undefined;

  const addTag = (rawTag: string) => {
    const trimmed = rawTag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setInputValue('');
      return;
    }
    if (value.length >= maxTags) return;
    onChange?.([...value, trimmed]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    if (disabled) return;
    onChange?.(value.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (paste.includes(',')) {
      e.preventDefault();
      const newTags = paste
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && !value.includes(t));
      if (newTags.length > 0) {
        onChange?.([...value, ...newTags].slice(0, maxTags));
        setInputValue('');
      }
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium text-text">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-input border border-border bg-surface px-3 py-1.5 text-sm text-text transition-colors',
          'focus-within:border-accent focus-within:ring-1 focus-within:ring-accent',
          error && 'border-error focus-within:border-error focus-within:ring-error',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        {value.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className="border-accent/25 bg-accent/10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium text-accent"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                onClick={() => removeTag(idx)}
                className="hover:bg-accent/20 ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-accent focus:outline-none"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {value.length < maxTags && (
          <input
            id={inputId}
            type="text"
            value={inputValue}
            placeholder={value.length === 0 ? placeholder : 'Add more...'}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId ?? helperId}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (inputValue.trim()) addTag(inputValue);
            }}
            onPaste={handlePaste}
            className="min-w-[120px] flex-1 bg-transparent py-0.5 text-xs text-text placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed"
          />
        )}
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-xs font-medium text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1 text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
