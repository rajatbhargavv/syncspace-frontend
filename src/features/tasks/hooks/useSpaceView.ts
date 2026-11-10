import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SpaceViewType = 'board' | 'list' | 'calendar';

export function useSpaceView(spaceId?: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlView = searchParams.get('view') as SpaceViewType | null;

  const storageKey = spaceId ? `syncspace:view:${spaceId}` : null;

  const currentView: SpaceViewType = useMemo(() => {
    if (urlView === 'board' || urlView === 'list' || urlView === 'calendar') {
      return urlView;
    }
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const stored = window.localStorage.getItem(storageKey) as SpaceViewType | null;
        if (stored === 'board' || stored === 'list' || stored === 'calendar') {
          return stored;
        }
      } catch {
        // localStorage error fallback
      }
    }
    return 'board';
  }, [urlView, storageKey]);

  useEffect(() => {
    if (storageKey && urlView !== null) {
      try {
        window.localStorage.setItem(storageKey, urlView);
      } catch {
        // localStorage error fallback
      }
    }
  }, [storageKey, urlView]);

  const setView = useCallback(
    (view: SpaceViewType) => {
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, view);
        } catch {
          // localStorage error fallback
        }
      }
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('view', view);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, storageKey],
  );

  return { view: currentView, setView };
}
