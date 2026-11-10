// ── Notifications Domain Types ──

export type NotificationType =
  | 'TASK_COMMENT'
  | 'TASK_CREATED'
  | 'SPACE_MEMBER_JOINED'
  | 'SPACE_MEMBER_LEFT'
  | 'SUBTASK_CREATED'
  | 'ASSIGNEE_TASK_COMPLETED'
  | 'ASSIGNEE_SUBTASK_COMPLETED';

export type NotificationResource = 'SPACE' | 'COMMENT' | 'TASK' | 'SUBTASK';

export interface NotificationItem {
  _id: string;
  recipientId: string;
  senderId?: string;
  message: string;
  type: NotificationType;
  resource?: NotificationResource;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsParams {
  unread?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  message?: string;
  notifications: NotificationItem[];
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MarkReadResponse {
  message?: string;
  notification: NotificationItem;
}

export interface MarkAllReadResponse {
  message?: string;
  modifiedCount: number;
}
