import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { useTheme } from '@/app/providers/useTheme';
import { useSpaceTheme } from './useSpaceTheme';

describe('useSpaceTheme', () => {
  it('applies space theme and restores on unmount', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result, unmount } = renderHook(
      () => {
        const theme = useTheme();
        useSpaceTheme({ preset: 'HEARTH', mode: 'light' });
        return theme;
      },
      { wrapper },
    );

    expect(result.current.effectivePreset).toBe('HEARTH');
    expect(result.current.effectiveMode).toBe('light');

    unmount();
  });

  it('allows toggling mode while space theme is active', () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    const { result } = renderHook(
      () => {
        const theme = useTheme();
        useSpaceTheme({ preset: 'HEARTH', mode: 'dark' });
        return theme;
      },
      { wrapper },
    );

    expect(result.current.effectiveMode).toBe('dark');

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.effectiveMode).toBe('light');

    act(() => {
      result.current.toggleMode();
    });

    expect(result.current.effectiveMode).toBe('dark');
  });
});
