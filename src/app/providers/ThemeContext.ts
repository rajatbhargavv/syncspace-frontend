import { createContext } from 'react';
import { THEME_MODE, THEME_PRESET } from '@/config/constants';

export type ThemePreset = keyof typeof THEME_PRESET;
export type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];

export interface ThemeContextValue {
  preset: ThemePreset;
  mode: ThemeMode;
  setPreset: (preset: ThemePreset) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setSpaceTheme: (theme: { preset: ThemePreset; mode: ThemeMode } | null) => void;
  effectivePreset: ThemePreset;
  effectiveMode: ThemeMode;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
