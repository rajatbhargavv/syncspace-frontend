import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { API_ENDPOINTS } from '@/config/constants';
import {
  getUnreadCount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notification.api';
import type { NotificationItem } from '../types/notification.types';

const mockNotification: NotificationItem = {
  _id: 'notif_1',
  userId: 'u_1',
  type: 'TASK_COMMENT',
  message: 'Alice commented on your task',
  isRead: false,
  resource: 'TASK',
  resourceId: 't_1',
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-01T12:00:00.000Z',
};

describe('notification.api', () => {
  it('getUnreadCount unwraps unreadCount number', async () => {
    server.use(
      http.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT, () => {
        return HttpResponse.json({
          message: 'Unread count fetched',
          unreadCount: 7,
        });
      }),
    );

    const count = await getUnreadCount();
    expect(count).toBe(7);
  });

  it('getNotifications unwraps notifications array with params', async () => {
    server.use(
      http.get(API_ENDPOINTS.NOTIFICATIONS.LIST, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('unread')).toBe('true');
        expect(url.searchParams.get('page')).toBe('1');
        return HttpResponse.json({
          message: 'Notifications fetched',
          notifications: [mockNotification],
        });
      }),
    );

    const list = await getNotifications({ unread: true, page: 1, limit: 20 });
    expect(list).toHaveLength(1);
    expect(list[0]?._id).toBe('notif_1');
    expect(list[0]?.type).toBe('TASK_COMMENT');
  });

  it('markNotificationRead unwraps updated notification', async () => {
    server.use(
      http.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ('notif_1'), () => {
        return HttpResponse.json({
          message: 'Marked read',
          notification: { ...mockNotification, isRead: true },
        });
      }),
    );

    const updated = await markNotificationRead('notif_1');
    expect(updated._id).toBe('notif_1');
    expect(updated.isRead).toBe(true);
  });

  it('markAllNotificationsRead unwraps modifiedCount', async () => {
    server.use(
      http.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, () => {
        return HttpResponse.json({
          message: 'All notifications marked read',
          modifiedCount: 12,
        });
      }),
    );

    const modified = await markAllNotificationsRead();
    expect(modified).toBe(12);
  });
});
