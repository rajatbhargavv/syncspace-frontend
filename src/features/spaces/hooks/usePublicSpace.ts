import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getPublicSpace } from '../api/space.api';
import type { PublicSpace } from '../types/space.types';

export function usePublicSpace(id: string): UseQueryResult<PublicSpace> {
  return useQuery({
    queryKey: queryKeys.spaces.public(id),
    queryFn: () => getPublicSpace(id),
    enabled: Boolean(id),
  });
}
