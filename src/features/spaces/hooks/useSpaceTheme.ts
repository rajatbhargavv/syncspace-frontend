import { useEffect } from 'react';
import { useTheme } from '@/app/providers/useTheme';
import type { Space, SpaceTheme } from '../types/space.types';

export function useSpaceTheme(spaceInput?: Pick<Space, 'theme'> | SpaceTheme | null): void {
  const { setSpaceTheme } = useTheme();

  const theme =
    spaceInput && 'theme' in spaceInput && typeof spaceInput.theme === 'object'
      ? spaceInput.theme
      : (spaceInput as SpaceTheme | null | undefined);

  const preset = theme?.preset;
  const mode = theme?.mode;

  useEffect(() => {
    if (!preset || !mode) {
      setSpaceTheme(null);
      return;
    }

    setSpaceTheme({ preset, mode });

    return () => {
      setSpaceTheme(null);
    };
  }, [preset, mode, setSpaceTheme]);
}
