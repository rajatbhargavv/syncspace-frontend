import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationResult,
} from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { markNotificationRead } from '../api/notification.api';
import type { NotificationItem } from '../types/notification.types';

interface MarkReadContext {
  previousUnreadCount?: number;
  previousInfinite?: [readonly unknown[], InfiniteData<NotificationItem[], number> | undefined][];
}

export function useMarkNotificationRead(): UseMutationResult<
  NotificationItem,
  Error,
  string,
  MarkReadContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id: string) => {
      const countKey = queryKeys.notifications.unreadCount();
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousUnreadCount = queryClient.getQueryData<number>(countKey);

      // Snapshot all matching infinite notification queries
      const infiniteQueries = queryClient.getQueriesData<InfiniteData<NotificationItem[], number>>({
        queryKey: [...queryKeys.notifications.all, 'infinite'],
      });

      // Optimistically decrement count
      queryClient.setQueryData<number>(countKey, (old = 0) => Math.max(0, old - 1));

      // Optimistically update isRead in infinite queries
      infiniteQueries.forEach(([key]) => {
        queryClient.setQueryData<InfiniteData<NotificationItem[], number>>(key, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif)),
            ),
          };
        });
      });

      return {
        previousUnreadCount,
        previousInfinite: infiniteQueries,
      };
    },
    onError: (_err, _id, context) => {
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          context.previousUnreadCount,
        );
      }
      context?.previousInfinite.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });
}
