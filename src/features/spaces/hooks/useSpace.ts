import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getSpaceById } from '../api/space.api';
import type { Space } from '../types/space.types';

export function useSpace(id: string): UseQueryResult<Space> {
  return useQuery({
    queryKey: queryKeys.spaces.byId(id),
    queryFn: () => getSpaceById(id),
    enabled: Boolean(id),
  });
}
