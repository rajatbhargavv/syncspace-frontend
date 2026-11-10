import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import {
  NotificationRow,
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadCount,
} from '@/features/notifications';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCountQuery = useUnreadCount();
  const notificationsQuery = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const count = unreadCountQuery.data ?? 0;
  const notifications = notificationsQuery.data?.pages.flatMap((page) => page).slice(0, 15) ?? [];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
      >
        <span aria-hidden="true" className="text-lg">
          🔔
        </span>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-4 text-text-inverse">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Notification Side Panel */}
      {isOpen && (
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          position="right"
          size="md"
          title={
            <div className="flex items-center justify-between gap-3 pr-2">
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-text">Notifications</span>
                {count > 0 && (
                  <span className="bg-accent/15 rounded-full px-2 py-0.5 text-xs font-semibold text-accent">
                    {count} new
                  </span>
                )}
              </div>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="text-xs font-medium text-accent hover:underline disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
            </div>
          }
        >
          <div className="flex h-full flex-col justify-between">
            {/* List Content */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
              {notificationsQuery.isLoading ? (
                <div className="space-y-3 p-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : notificationsQuery.isError ? (
                <ErrorState
                  message="Failed to load notifications."
                  onRetry={() => void notificationsQuery.refetch()}
                />
              ) : notifications.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    title="No notifications"
                    description="You are all caught up with your spaces and tasks."
                  />
                </div>
              ) : (
                notifications.map((item) => (
                  <NotificationRow
                    key={item._id}
                    notification={item}
                    onNavigate={() => setIsOpen(false)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-border pt-3 text-center">
              <Link
                to={ROUTES.notifications}
                onClick={() => setIsOpen(false)}
                className="bg-surface-hover/80 inline-block w-full rounded-button py-2.5 text-center text-xs font-semibold text-accent transition-colors hover:bg-surface-hover hover:underline"
              >
                View all notifications →
              </Link>
            </div>
          </div>
        </Drawer>
      )}
    </>
  );
};
