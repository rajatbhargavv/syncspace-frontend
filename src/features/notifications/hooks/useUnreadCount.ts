import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getUnreadCount } from '../api/notification.api';

export function useUnreadCount(): UseQueryResult<number> {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadCount,
    refetchInterval: 120_000,
    refetchOnWindowFocus: true,
  });
}
