import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getPendingMembers } from '../api/pending-member.api';
import type { SpaceMember } from '../types/member.types';

export function usePendingMembers(spaceId: string): UseQueryResult<SpaceMember[]> {
  return useQuery({
    queryKey: [...queryKeys.members.bySpace(spaceId), 'pending'],
    queryFn: () => getPendingMembers(spaceId),
    enabled: Boolean(spaceId),
    retry: false,
  });
}
