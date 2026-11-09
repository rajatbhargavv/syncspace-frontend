import React from 'react';
import { cn } from '@/lib/cn';
import type { ThemePreset, ThemeMode } from '../types/space.types';

/**
 * ThemeScope isolates theme variables (`--color-*`, `--radius-*`, `--font-*`)
 * to a local DOM subtree. This is useful for live space theme previews or
 * widgets without affecting the rest of the application layout.
 *
 * NOTE on Portaled Content:
 * Modals, Dialogs, Drawers, and Tooltips rendered via React Portals directly into
 * `document.body` inherit theme tokens from `document.documentElement` rather than
 * this local scope. If portaled UI must reflect this scoped theme, either pass a
 * portal container element inside this scope or wrap the portaled dialog in its own
 * `<ThemeScope>`.
 */
export interface ThemeScopeProps {
  theme: ThemePreset;
  mode?: ThemeMode;
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
}

export const ThemeScope: React.FC<ThemeScopeProps> = ({
  theme,
  mode = 'dark',
  children,
  className,
  as: Component = 'div',
}) => {
  return (
    <Component data-theme={theme} data-mode={mode} className={cn('text-text', className)}>
      {children}
    </Component>
  );
};
