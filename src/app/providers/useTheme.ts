import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeContext';

const defaultThemeValue: ThemeContextValue = {
  preset: 'ORBIT',
  mode: 'system',
  effectivePreset: 'ORBIT',
  effectiveMode: 'dark',
  setPreset: () => {},
  setMode: () => {},
  toggleMode: () => {},
  setSpaceTheme: () => {},
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  return context ?? defaultThemeValue;
}
