import React, { useMemo, useState } from 'react';
import { isToday, isYesterday, parseISO } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, EmptyState, ErrorState, Skeleton, Tabs, type TabItem } from '@/components/ui';
import {
  NotificationRow,
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadCount,
  type NotificationItem,
} from '../index';

const TABS: TabItem[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
];

interface DayGroup {
  label: string;
  items: NotificationItem[];
}

function groupNotificationsByDay(items: NotificationItem[]): DayGroup[] {
  const today: NotificationItem[] = [];
  const yesterday: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];

  for (const item of items) {
    const d = parseISO(item.createdAt);
    if (isToday(d)) {
      today.push(item);
    } else if (isYesterday(d)) {
      yesterday.push(item);
    } else {
      earlier.push(item);
    }
  }

  const groups: DayGroup[] = [];
  if (today.length > 0) groups.push({ label: 'Today', items: today });
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', items: yesterday });
  if (earlier.length > 0) groups.push({ label: 'Earlier', items: earlier });

  return groups;
}

export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const unreadOnly = activeTab === 'unread';

  const query = useNotifications({ unread: unreadOnly ? true : undefined });
  const unreadCount = useUnreadCount();
  const markAllRead = useMarkAllNotificationsRead();

  const allItems = useMemo(
    () => query.data?.pages.flatMap((page) => page) ?? [],
    [query.data?.pages],
  );

  const dayGroups = useMemo(() => groupNotificationsByDay(allItems), [allItems]);
  const count = unreadCount.data ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Notifications"
          description="Stay updated with task assignments, comments, and space activity."
        />

        {count > 0 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            {markAllRead.isPending ? 'Marking read...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as 'all' | 'unread')}
            variant="pills"
          />

          <span className="text-xs text-text-muted">
            {count > 0 ? `${count} unread` : 'All caught up'}
          </span>
        </div>

        {/* Content View */}
        {query.isLoading ? (
          <div className="space-y-3 py-4" data-testid="notifications-loading">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full" />
            ))}
          </div>
        ) : query.isError ? (
          <ErrorState
            message={query.error.message || 'Unable to load notifications.'}
            onRetry={() => void query.refetch()}
          />
        ) : allItems.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
              description={
                unreadOnly
                  ? 'You are all caught up! Check the All tab for previous notifications.'
                  : 'You will see updates here when members assign tasks, comment, or join spaces.'
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            {dayGroups.map((group) => (
              <section key={group.label} aria-labelledby={`day-group-${group.label}`}>
                <h3
                  id={`day-group-${group.label}`}
                  className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted"
                >
                  {group.label}
                </h3>
                <div className="space-y-2">
                  {group.items.map((notification) => (
                    <NotificationRow key={notification._id} notification={notification} />
                  ))}
                </div>
              </section>
            ))}

            {/* Pagination / Load More */}
            {query.hasNextPage && (
              <div className="pt-2 text-center">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? 'Loading more...' : 'Load older notifications'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
