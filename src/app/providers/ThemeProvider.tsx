import React, { useEffect, useState } from 'react';
import { THEME_PRESET } from '@/config/constants';
import { storage } from '@/lib/storage';
import {
  ThemeContext,
  type ThemeMode,
  type ThemePreferenceMode,
  type ThemePreset,
} from './ThemeContext';

function isValidPreset(value: string | null): value is ThemePreset {
  return value !== null && Object.values(THEME_PRESET).includes(value as ThemePreset);
}

function isValidMode(value: string | null): value is ThemePreferenceMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getSystemMode(): ThemeMode {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
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

  const [mode, setModeState] = useState<ThemePreferenceMode>(() => {
    const stored = storage.getThemeMode();
    if (isValidMode(stored)) return stored;
    return 'system';
  });

  // Space-specific theme override (active when viewing a space)
  const [spaceTheme, setSpaceTheme] = useState<{ preset: ThemePreset; mode: ThemeMode } | null>(
    null,
  );

  const effectivePreset = spaceTheme?.preset ?? preset;
  const effectiveMode = spaceTheme?.mode ?? (mode === 'system' ? getSystemMode() : mode);

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
    setSpaceTheme((current) => (current ? { ...current, preset: newPreset } : null));
  };

  const setMode = (newMode: ThemePreferenceMode) => {
    setModeState(newMode);
    storage.setThemeMode(newMode);
    setSpaceTheme((current) =>
      current
        ? {
            ...current,
            mode: newMode === 'system' ? getSystemMode() : newMode,
          }
        : null,
    );
  };

  const toggleMode = () => {
    const nextMode = effectiveMode === 'dark' ? 'light' : 'dark';
    setMode(nextMode);
  };

  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => setModeState('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [mode]);

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
