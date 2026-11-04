import React, { useEffect, useState } from 'react';
import { THEME_PRESET } from '@/config/constants';
import { storage } from '@/lib/storage';
import { ThemeContext, type ThemeMode, type ThemePreset } from './ThemeContext';

function isValidPreset(value: string | null): value is ThemePreset {
  return value !== null && Object.values(THEME_PRESET).includes(value as ThemePreset);
}

function isValidMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // User's default theme (stored in localStorage)
  const [preset, setPresetState] = useState<ThemePreset>(() => {
    const stored = storage.getThemePreset();
    return isValidPreset(stored) ? stored : 'ORBIT';
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = storage.getThemeMode();
    if (isValidMode(stored)) return stored;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light';
    }
    return 'dark';
  });

  // Space-specific theme override (active when viewing a space)
  const [spaceTheme, setSpaceTheme] = useState<{ preset: ThemePreset; mode: ThemeMode } | null>(
    null,
  );

  const effectivePreset = spaceTheme?.preset ?? preset;
  const effectiveMode = spaceTheme?.mode ?? mode;

  // Apply data-theme and data-mode attributes to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', effectivePreset);
    root.setAttribute('data-mode', effectiveMode);

    if (effectiveMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectivePreset, effectiveMode]);

  const setPreset = (newPreset: ThemePreset) => {
    setPresetState(newPreset);
    storage.setThemePreset(newPreset);
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    storage.setThemeMode(newMode);
  };

  const toggleMode = () => {
    const nextMode = effectiveMode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        preset,
        mode,
        setPreset,
        setMode,
        toggleMode,
        setSpaceTheme,
        effectivePreset,
        effectiveMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};