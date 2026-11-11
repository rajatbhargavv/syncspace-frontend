import { useEffect, useState } from 'react';

export interface ChartColors {
  accent: string;
  surface: string;
  text: string;
  muted: string;
  grid: string;
  palette: string[];
}

function readColors(): ChartColors {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;
  return {
    accent: read('--color-accent', '#ff8a1f'),
    surface: read('--color-surface', '#141416'),
    text: read('--color-text', '#f5f5f5'),
    muted: read('--color-text-muted', '#8a8a8e'),
    grid: read('--color-border', '#2a2a2d'),
    palette: ['#ff8a1f', '#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#f87171'],
  };
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(() =>
    typeof document === 'undefined'
      ? {
          accent: '#ff8a1f',
          surface: '#141416',
          text: '#f5f5f5',
          muted: '#8a8a8e',
          grid: '#2a2a2d',
          palette: ['#ff8a1f', '#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#f87171'],
        }
      : readColors(),
  );
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-mode'] });
    setColors(readColors());
    return () => observer.disconnect();
  }, []);
  return colors;
}
