import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type UseMutationResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { markAllNotificationsRead } from '../api/notification.api';
import type { NotificationItem } from '../types/notification.types';

interface MarkAllReadContext {
  previousUnreadCount?: number;
  previousInfinite?: [readonly unknown[], InfiniteData<NotificationItem[], number> | undefined][];
}

export function useMarkAllNotificationsRead(): UseMutationResult<
  number,
  Error,
  void,
  MarkAllReadContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      const countKey = queryKeys.notifications.unreadCount();
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousUnreadCount = queryClient.getQueryData<number>(countKey);
      const infiniteQueries = queryClient.getQueriesData<InfiniteData<NotificationItem[], number>>({
        queryKey: [...queryKeys.notifications.all, 'infinite'],
      });

      queryClient.setQueryData<number>(countKey, 0);

      infiniteQueries.forEach(([key]) => {
        queryClient.setQueryData<InfiniteData<NotificationItem[], number>>(key, (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => page.map((notif) => ({ ...notif, isRead: true }))),
          };
        });
      });

      return {
        previousUnreadCount,
        previousInfinite: infiniteQueries,
      };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          context.previousUnreadCount,
        );
      }
      context?.previousInfinite.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error('Failed to mark all notifications as read');
    },
    onSuccess: (count) => {
      if (count > 0) {
        toast.success(`Marked ${count} notification${count === 1 ? '' : 's'} as read`);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
