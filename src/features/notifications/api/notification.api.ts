import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type {
  GetNotificationsParams,
  MarkAllReadResponse,
  MarkReadResponse,
  NotificationItem,
  NotificationsResponse,
  UnreadCountResponse,
} from '../types/notification.types';

export async function getUnreadCount(): Promise<number> {
  const response = await http.get<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  return response.unreadCount;
}

export async function getNotifications(
  params?: GetNotificationsParams,
): Promise<NotificationItem[]> {
  const response = await http.get<NotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.LIST, {
    params: {
      unread: params?.unread,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    },
  });
  return response.notifications;
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const response = await http.patch<MarkReadResponse>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  return response.notification;
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await http.patch<MarkAllReadResponse>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  return response.modifiedCount;
}
