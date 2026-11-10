import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { formatDateTime, formatRelative } from '@/lib/date';
import { ROUTES } from '@/config/routes';
import type { NotificationItem } from '../types/notification.types';
import { getNotificationMeta, resolveNotificationDestination } from '../utils/notificationUtils';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';

export interface NotificationRowProps {
  notification: NotificationItem;
  onNavigate?: () => void;
}

export const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();
  const meta = getNotificationMeta(notification.type);

  const handleClick = async () => {
    if (!notification.isRead) {
      markRead.mutate(notification._id);
    }

    try {
      const destination = await resolveNotificationDestination(notification);
      if (destination) {
        onNavigate?.();
        navigate(destination);
      } else {
        toast.info(notification.message);
        onNavigate?.();
        navigate(ROUTES.notifications);
      }
    } catch {
      onNavigate?.();
      navigate(ROUTES.notifications);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleClick();
        }
      }}
      className={`group relative flex cursor-pointer items-start gap-3 rounded-card border p-3 text-left transition-colors ${
        notification.isRead
          ? 'border-border/60 bg-surface/60 hover:bg-surface-hover/80 text-text-muted'
          : 'border-accent/30 bg-accent/5 hover:bg-accent/10 text-text'
      }`}
      aria-label={`${notification.isRead ? 'Read' : 'Unread'} notification: ${notification.message}`}
    >
      {/* Icon badge */}
      <div
        aria-hidden="true"
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${meta.badgeClass}`}
      >
        {meta.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 text-text">
          {notification.message}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <time
            dateTime={new Date(notification.createdAt).toISOString()}
            title={formatDateTime(notification.createdAt)}
            className="hover:underline"
          >
            {formatRelative(notification.createdAt)}
          </time>
          <span>•</span>
          <span>{meta.label}</span>
        </div>
      </div>

      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span
          className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent ring-2 ring-surface"
          aria-hidden="true"
          title="Unread"
        />
      )}
    </div>
  );
};
