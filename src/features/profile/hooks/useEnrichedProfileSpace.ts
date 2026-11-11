import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicSpace } from '@/features/spaces';
import { queryKeys } from '@/lib/queryKeys';
import type { ProfileSpace } from '../types/profile.types';

export function useEnrichedProfileSpace(space: ProfileSpace, shouldEnrich = true) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const needsEnrichment =
    shouldEnrich &&
    (!space.kind || !space.theme || !space.description || space.memberCount === undefined);
  const query = useQuery({
    queryKey: queryKeys.spaces.public(space._id),
    queryFn: () => getPublicSpace(space._id),
    enabled: isVisible && needsEnrichment,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    ref,
    space:
      query.data && needsEnrichment
        ? {
            ...space,
            description: space.description ?? query.data.description,
            kind: space.kind ?? query.data.kind,
            theme: space.theme ?? query.data.theme,
            memberCount: space.memberCount ?? query.data.memberCount,
          }
        : space,
  };
}
