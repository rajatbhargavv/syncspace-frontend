import { describe, expect, it, vi } from 'vitest';
import { getNotificationMeta, resolveNotificationDestination } from './notificationUtils';
import type { NotificationItem, NotificationType } from '../types/notification.types';

vi.mock('@/features/tasks', () => ({
  getTaskById: vi.fn().mockImplementation((id: string) => {
    if (id === 'task_exists') {
      return Promise.resolve({ _id: 'task_exists', spaceId: 'space_456' });
    }
    return Promise.reject(new Error('Task not found'));
  }),
}));

const baseNotification: NotificationItem = {
  _id: 'n_1',
  userId: 'u_1',
  type: 'TASK_COMMENT',
  message: 'New comment',
  isRead: false,
  createdAt: '2026-03-01T12:00:00.000Z',
  updatedAt: '2026-03-01T12:00:00.000Z',
};

describe('notificationUtils', () => {
  describe('getNotificationMeta', () => {
    const types: NotificationType[] = [
      'TASK_COMMENT',
      'TASK_CREATED',
      'SPACE_MEMBER_JOINED',
      'SPACE_MEMBER_LEFT',
      'SUBTASK_CREATED',
      'ASSIGNEE_TASK_COMPLETED',
      'ASSIGNEE_SUBTASK_COMPLETED',
    ];

    it.each(types)('returns distinct icon and label for %s', (type) => {
      const meta = getNotificationMeta(type);
      expect(meta.icon).toBeDefined();
      expect(meta.label).toBeDefined();
      expect(meta.badgeClass).toBeDefined();
    });

    it('returns default fallback meta for unknown type', () => {
      const meta = getNotificationMeta('UNKNOWN_EVENT' as unknown as NotificationType);
      expect(meta.label).toBe('Notification');
      expect(meta.icon).toBe('🔔');
    });
  });

  describe('resolveNotificationDestination', () => {
    it('resolves SPACE resource directly to /spaces/:id', async () => {
      const notif: NotificationItem = {
        ...baseNotification,
        resource: 'SPACE',
        resourceId: 'space_123',
      };
      const dest = await resolveNotificationDestination(notif);
      expect(dest).toBe('/spaces/space_123');
    });

    it('resolves TASK resource by fetching spaceId', async () => {
      const notif: NotificationItem = {
        ...baseNotification,
        resource: 'TASK',
        resourceId: 'task_exists',
      };
      const dest = await resolveNotificationDestination(notif);
      expect(dest).toBe('/spaces/space_456?task=task_exists');
    });

    it('returns /notifications when TASK resolution fails', async () => {
      const notif: NotificationItem = {
        ...baseNotification,
        resource: 'TASK',
        resourceId: 'task_missing',
      };
      const dest = await resolveNotificationDestination(notif);
      expect(dest).toBe('/notifications');
    });

    it('returns null for COMMENT or SUBTASK resources due to missing parent ids', async () => {
      const commentNotif: NotificationItem = {
        ...baseNotification,
        resource: 'COMMENT',
        resourceId: 'comment_99',
      };
      const subtaskNotif: NotificationItem = {
        ...baseNotification,
        resource: 'SUBTASK',
        resourceId: 'subtask_99',
      };
      expect(await resolveNotificationDestination(commentNotif)).toBeNull();
      expect(await resolveNotificationDestination(subtaskNotif)).toBeNull();
    });

    it('returns /notifications when resource is absent', async () => {
      const notif: NotificationItem = {
        ...baseNotification,
      };
      const dest = await resolveNotificationDestination(notif);
      expect(dest).toBe('/notifications');
    });
  });
});
