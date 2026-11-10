// ── Notifications Feature Public API ──

export type {
  NotificationType,
  NotificationResource,
  NotificationItem,
  GetNotificationsParams,
  NotificationsResponse,
  UnreadCountResponse,
  MarkReadResponse,
  MarkAllReadResponse,
} from './types/notification.types';

export {
  getUnreadCount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './api/notification.api';

export { useUnreadCount } from './hooks/useUnreadCount';
export { useNotifications, type UseNotificationsOptions } from './hooks/useNotifications';
export { useMarkNotificationRead } from './hooks/useMarkNotificationRead';
export { useMarkAllNotificationsRead } from './hooks/useMarkAllNotificationsRead';

export {
  getNotificationMeta,
  resolveNotificationDestination,
  type NotificationMeta,
} from './utils/notificationUtils';

export { NotificationRow, type NotificationRowProps } from './components/NotificationRow';
