import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactElement;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignStyles = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        },
        'aria-haspopup': 'true',
        'aria-expanded': isOpen,
      })}

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'z-dropdown animate-in fade-in zoom-in-95 absolute mt-2 w-48 rounded-card border border-border bg-surface py-1 shadow-elevated duration-100',
            alignStyles,
            className,
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-medium transition-colors',
                item.danger ? 'hover:bg-error/10 text-error' : 'text-text hover:bg-surface-hover',
                item.disabled && 'pointer-events-none cursor-not-allowed opacity-50',
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};