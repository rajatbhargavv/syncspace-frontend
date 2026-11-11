import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getUserProfile } from '../api/profile.api';
import type { UserProfile } from '../types/profile.types';

export function useUserProfile(id: string): UseQueryResult<UserProfile> {
  return useQuery({
    queryKey: queryKeys.users.profile(id),
    queryFn: () => getUserProfile(id),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
