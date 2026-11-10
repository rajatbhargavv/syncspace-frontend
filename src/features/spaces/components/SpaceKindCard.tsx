import React from 'react';
import { cn } from '@/lib/cn';
import type { SpaceKind } from '../types/space.types';
import type { SpaceKindConfig } from '../utils/spaceKindConfig';
import { ThemePreview } from './ThemePreview';

export interface SpaceKindCardProps {
  config: SpaceKindConfig;
  selected: boolean;
  onSelect: (kind: SpaceKind) => void;
}

export const SpaceKindCard: React.FC<SpaceKindCardProps> = ({ config, selected, onSelect }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={() => onSelect(config.kind)}
    className={cn(
      'group rounded-card border bg-surface p-3 text-left transition hover:border-accent focus-visible:outline-2 focus-visible:outline-accent',
      selected ? 'ring-accent/30 border-accent ring-2' : 'border-border',
    )}
  >
    <ThemePreview theme={config.defaultTheme.preset} mode={config.defaultTheme.mode} compact />
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-sm font-semibold text-text">{config.label}</h3>
        {selected && <span className="text-xs font-semibold text-accent">Selected</span>}
      </div>
      <p className="mt-1 text-xs leading-5 text-text-muted">{config.tagline}</p>
    </div>
  </button>
);
