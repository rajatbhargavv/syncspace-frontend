import React from 'react';
import { Toggle } from '@/components/ui';
import type { ThemeMode } from '../types/space.types';

export interface ModeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => (
  <Toggle
    label={mode === 'dark' ? 'Dark mode' : 'Light mode'}
    description="You can change this later in space settings."
    checked={mode === 'dark'}
    onChange={(checked) => onChange(checked ? 'dark' : 'light')}
  />
);
