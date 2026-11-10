import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import {
  type NotificationItem,
  resolveNotificationDestination,
} from '@/features/notifications';
import type { Task } from '@/features/tasks';
import type { CommentItem, TimelineItem } from '@/features/comments';

export function useRealtimeSync(): void {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Notification Event
  const handleNotification = useCallback(
    (notification: NotificationItem) => {
      // Optimistically increment unread count in bell
      queryClient.setQueryData<number>(
        queryKeys.notifications.unreadCount(),
        (old = 0) => old + 1,
      );

      // Prepend to infinite queries if not already present
      const infiniteQueries = queryClient.getQueriesData<InfiniteData<NotificationItem[], number>>({
        queryKey: [...queryKeys.notifications.all, 'infinite'],
      });

      infiniteQueries.forEach(([key]) => {
        queryClient.setQueryData<InfiniteData<NotificationItem[], number>>(key, (old) => {
          if (!old || old.pages.length === 0) return old;
          const alreadyExists = old.pages.some((page) =>
            page.some((item) => item._id === notification._id),
          );
          if (alreadyExists) return old;
          const [firstPage, ...restPages] = old.pages;
          return {
            ...old,
            pages: [[notification, ...(firstPage ?? [])], ...restPages],
          };
        });
      });

      // Check if user is currently viewing the affected task
      const searchParams = new URLSearchParams(location.search);
      const openTaskId = searchParams.get('task');
      const isViewingTask =
        notification.resource === 'TASK' && notification.resourceId === openTaskId;

      if (!isViewingTask) {
        toast(notification.message, {
          action: {
            label: 'View',
            onClick: () => {
              void resolveNotificationDestination(notification).then((dest) => {
                if (dest) {
                  navigate(dest);
                }
              });
            },
          },
        });
      }
    },
    [location.search, navigate, queryClient],
  );

  // 2. Task Updated Event
  const handleTaskUpdated = useCallback(
    (task: Task) => {
      const existing = queryClient.getQueryData<Task>(queryKeys.tasks.byId(task._id));
      if (existing?.updatedAt && task.updatedAt) {
        const existingTime = new Date(existing.updatedAt).getTime();
        const incomingTime = new Date(task.updatedAt).getTime();
        if (incomingTime < existingTime) {
          return; // Ignore older incoming echo
        }
      }

      if (task.lifecycleStatus === 'DELETED') {
        queryClient.setQueryData(queryKeys.tasks.byId(task._id), null);
        queryClient.setQueriesData<Task[]>(
          { queryKey: ['tasks', 'space', task.spaceId] },
          (old) => old?.filter((t) => t._id !== task._id),
        );
      } else {
        queryClient.setQueryData(queryKeys.tasks.byId(task._id), task);
        queryClient.setQueriesData<Task[]>(
          { queryKey: ['tasks', 'space', task.spaceId] },
          (old) => {
            if (!old) return old;
            const index = old.findIndex((t) => t._id === task._id);
            if (index >= 0) {
              const copy = [...old];
              copy[index] = task;
              return copy;
            }
            return [task, ...old];
          },
        );
      }

      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byId(task._id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.timeline(task._id) });
    },
    [queryClient],
  );

  // 3. Comment Created Event
  const handleCommentCreated = useCallback(
    (comment: CommentItem) => {
      const timelineKey = queryKeys.comments.timeline(comment.taskId);

      queryClient.setQueryData<TimelineItem[]>(timelineKey, (old) => {
        if (!old) return old;
        const exists = old.some(
          (item) => item.kind === 'comment' && item._id === comment._id,
        );
        if (exists) return old;
        const commentItem: CommentItem = {
          ...comment,
          kind: 'comment',
        };
        return [...old, commentItem];
      });

      void queryClient.invalidateQueries({ queryKey: timelineKey });
    },
    [queryClient],
  );

  useSocketEvent('notification', handleNotification);
  useSocketEvent('task:updated', handleTaskUpdated);
  useSocketEvent('comment:created', handleCommentCreated);
}
