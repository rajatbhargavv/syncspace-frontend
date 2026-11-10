import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useUnreadCount } from '@/features/notifications';

export const NotificationBell: React.FC = () => {
  const query = useUnreadCount();
  const count = query.data ?? 0;
  return (
    <Link
      to={ROUTES.notifications}
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-hover hover:text-text"
    >
      <span aria-hidden="true" className="text-lg">
        ♢
      </span>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] font-bold leading-4 text-text-inverse">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
};
