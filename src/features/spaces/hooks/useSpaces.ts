import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getMySpaces } from '../api/space.api';
import type { SpaceSummary } from '../types/space.types';

export function useSpaces(enabled = true): UseQueryResult<SpaceSummary[]> {
  return useQuery({
    queryKey: queryKeys.spaces.list(),
    queryFn: getMySpaces,
    enabled,
  });
}
