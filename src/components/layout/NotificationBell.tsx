import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import {
  NotificationRow,
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadCount,
} from '@/features/notifications';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCountQuery = useUnreadCount();
  const notificationsQuery = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const count = unreadCountQuery.data ?? 0;
  const notifications = notificationsQuery.data?.pages.flatMap((page) => page).slice(0, 10) ?? [];

  // Close panel on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        bellRef.current &&
        !bellRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={bellRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text transition-colors"
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

      {/* Popover Panel / Mobile Drawer */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications overview"
          className="fixed inset-x-2 top-16 z-50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 overflow-hidden rounded-card border border-border bg-surface shadow-elevated"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface-hover/40 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-heading text-sm font-semibold text-text">Notifications</span>
              {count > 0 && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {count} new
                </span>
              )}
            </div>

            {count > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-xs text-accent hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-2">
            {notificationsQuery.isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : notificationsQuery.isError ? (
              <ErrorState
                message="Failed to load notifications."
                onRetry={() => void notificationsQuery.refetch()}
              />
            ) : notifications.length === 0 ? (
              <div className="py-4">
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
          <div className="border-t border-border bg-surface-hover/20 p-2 text-center">
            <Link
              to={ROUTES.notifications}
              onClick={() => setIsOpen(false)}
              className="inline-block w-full rounded-button py-1.5 text-xs font-semibold text-accent hover:bg-surface-hover transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
