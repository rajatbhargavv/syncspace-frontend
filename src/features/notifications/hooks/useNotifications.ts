import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getNotifications } from '../api/notification.api';
import type { NotificationItem } from '../types/notification.types';

export interface UseNotificationsOptions {
  unread?: boolean;
}

export function useNotifications(
  options: UseNotificationsOptions = {},
): UseInfiniteQueryResult<InfiniteData<NotificationItem[], number>> {
  const { unread } = options;

  return useInfiniteQuery({
    queryKey: [...queryKeys.notifications.all, 'infinite', { unread: unread ?? false }],
    queryFn: ({ pageParam }) =>
      getNotifications({
        unread,
        page: pageParam,
        limit: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length >= 20 ? allPages.length + 1 : undefined;
    },
    refetchOnWindowFocus: true,
  });
}
