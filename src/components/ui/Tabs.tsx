import React from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pills';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'underline',
}) => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1',
        variant === 'underline' && 'border-b border-border',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === 'pills') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-accent font-semibold text-text-inverse'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text',
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'py-0.2 rounded-full px-1.5 text-[10px]',
                    isActive
                      ? 'bg-text-inverse/20 text-text-inverse'
                      : 'bg-surface text-text-muted',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-accent font-semibold text-accent'
                : 'border-transparent text-text-muted hover:border-border hover:text-text',
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1 rounded-full border border-border bg-surface px-1.5 py-0.5 text-xs text-text-muted">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
