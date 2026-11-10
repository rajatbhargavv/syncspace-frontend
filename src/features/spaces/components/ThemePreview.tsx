import React from 'react';
import { ThemeScope } from './ThemeScope';
import type { ThemeMode, ThemePreset } from '../types/space.types';

export interface ThemePreviewProps {
  theme: ThemePreset;
  mode: ThemeMode;
  compact?: boolean;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, mode, compact = false }) => (
  <ThemeScope
    theme={theme}
    mode={mode}
    className={`overflow-hidden rounded-card border border-border bg-surface p-3 ${
      compact ? 'h-28' : 'h-36'
    }`}
    aria-label={`${theme} ${mode} theme preview`}
  >
    <div className="mb-2 flex items-center justify-between">
      <div className="bg-accent/70 h-2 w-20 rounded-full" />
      <div className="bg-text-muted/40 h-2 w-8 rounded-full" />
    </div>
    <div className="grid grid-cols-3 gap-2">
      {['To do', 'Doing', 'Done'].map((column, index) => (
        <div key={column} className="rounded-input bg-surface-hover p-1.5">
          <div className="mb-2 text-[8px] font-semibold uppercase tracking-wide text-text-muted">
            {column}
          </div>
          <div className="space-y-1.5">
            <div className="h-7 rounded-input border border-border bg-surface p-1.5">
              <div className={`bg-accent/60 h-1.5 rounded-full ${index === 1 ? 'w-10' : 'w-8'}`} />
            </div>
            {!compact && index !== 2 && (
              <div className="bg-surface/70 h-5 rounded-input border border-border" />
            )}
          </div>
        </div>
      ))}
    </div>
  </ThemeScope>
);
