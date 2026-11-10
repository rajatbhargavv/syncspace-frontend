import { getTaskById } from '@/features/tasks';
import { ROUTES } from '@/config/routes';
import type { NotificationItem, NotificationType } from '../types/notification.types';

export interface NotificationMeta {
  icon: string;
  badgeClass: string;
  label: string;
}

export function getNotificationMeta(type: NotificationType): NotificationMeta {
  switch (type) {
    case 'TASK_COMMENT':
      return {
        icon: '💬',
        badgeClass: 'bg-accent/15 text-accent',
        label: 'Comment',
      };
    case 'TASK_CREATED':
      return {
        icon: '✦',
        badgeClass: 'bg-info/15 text-info',
        label: 'Task Created',
      };
    case 'SPACE_MEMBER_JOINED':
      return {
        icon: '👋',
        badgeClass: 'bg-success/15 text-success',
        label: 'Member Joined',
      };
    case 'SPACE_MEMBER_LEFT':
      return {
        icon: '🚪',
        badgeClass: 'bg-surface-hover text-text-muted',
        label: 'Member Left',
      };
    case 'SUBTASK_CREATED':
      return {
        icon: '☑',
        badgeClass: 'bg-info/15 text-info',
        label: 'Subtask Created',
      };
    case 'ASSIGNEE_TASK_COMPLETED':
      return {
        icon: '🎉',
        badgeClass: 'bg-success/15 text-success',
        label: 'Task Completed',
      };
    case 'ASSIGNEE_SUBTASK_COMPLETED':
      return {
        icon: '✓',
        badgeClass: 'bg-success/15 text-success',
        label: 'Subtask Completed',
      };
    default:
      return {
        icon: '🔔',
        badgeClass: 'bg-accent/15 text-accent',
        label: 'Notification',
      };
  }
}

/**
 * Resolves destination URL from notification payload.
 * Returns destination route or null if unresolvable.
 */
export async function resolveNotificationDestination(
  notification: NotificationItem,
): Promise<string | null> {
  const { resource, resourceId } = notification;

  if (!resource || !resourceId) {
    return ROUTES.notifications;
  }

  // 1. Space resource -> /spaces/:id
  if (resource === 'SPACE') {
    return ROUTES.space(resourceId);
  }

  // 2. Task resource -> fetch task to get spaceId -> /spaces/:spaceId?task=:taskId
  if (resource === 'TASK') {
    try {
      const task = await getTaskById(resourceId);
      if (task.spaceId) {
        return `${ROUTES.space(task.spaceId)}?task=${task._id}`;
      }
    } catch {
      return ROUTES.notifications;
    }
  }

  // 3. For COMMENT or SUBTASK resources, resourceId is commentId or subtaskId.
  // Backend payload currently lacks parent spaceId and taskId.
  return null;
}
