import React from 'react';
import { cn } from '@/lib/cn';
import { THEME_PRESET } from '@/config/constants';
import type { ThemePreset, SpaceTheme } from '../types/space.types';

export interface SpaceThemeDotProps {
  theme: ThemePreset | SpaceTheme;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const THEME_DOT_COLORS: Record<ThemePreset, string> = {
  [THEME_PRESET.ORBIT]: 'bg-[#ff8a1f] shadow-[0_0_8px_rgba(255,138,31,0.5)]',
  [THEME_PRESET.HEARTH]: 'bg-[#e07b4c] shadow-[0_0_8px_rgba(224,123,76,0.5)]',
  [THEME_PRESET.NEON_GRID]: 'bg-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.5)]',
  [THEME_PRESET.IVORY_INK]: 'bg-[#b8963a] shadow-[0_0_8px_rgba(184,150,58,0.5)]',
};

const SIZES = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
};

export const SpaceThemeDot: React.FC<SpaceThemeDotProps> = ({ theme, className, size = 'md' }) => {
  const preset: ThemePreset = typeof theme === 'string' ? theme : theme.preset;
  const colorClass = THEME_DOT_COLORS[preset];

  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full transition-transform',
        SIZES[size],
        colorClass,
        className,
      )}
      aria-hidden="true"
    />
  );
};
