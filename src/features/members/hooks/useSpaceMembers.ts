import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getSpaceMembers } from '../api/member.api';
import type { SpaceMember } from '../types/member.types';

export function useSpaceMembers(spaceId: string): UseQueryResult<SpaceMember[]> {
  return useQuery({
    queryKey: queryKeys.members.bySpace(spaceId),
    queryFn: () => getSpaceMembers(spaceId),
    enabled: Boolean(spaceId),
  });
}
