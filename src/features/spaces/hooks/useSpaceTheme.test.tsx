import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
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
});
