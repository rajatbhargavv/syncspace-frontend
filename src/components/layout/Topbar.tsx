import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useUiStore } from '@/stores/uiStore';
import { useSocketStatus, useTheme } from '@/app/providers';
import { SpaceSwitcher } from './SpaceSwitcher';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  onOpenMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMenu }) => {
  const { toggleSidebar } = useUiStore();
  const socketStatus = useSocketStatus();
  const { effectiveMode, toggleMode } = useTheme();
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    if (socketStatus === 'connected') {
      setShowReconnecting(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowReconnecting(true);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [socketStatus]);

  return (
    <header className="bg-surface/90 safe-top sticky top-0 z-sticky flex min-h-16 items-center gap-3 border-b border-border px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        className="rounded-button p-2 text-text-muted hover:bg-surface-hover md:hidden"
        onClick={onOpenMenu}
      >
        ☰
      </button>
      <button
        type="button"
        aria-label="Toggle sidebar"
        className="hidden rounded-button p-2 text-text-muted hover:bg-surface-hover md:block"
        onClick={toggleSidebar}
      >
        ☰
      </button>
      <Link to={ROUTES.home} className="hidden lg:block">
        <span className="font-heading font-bold text-text">
          sync<span className="text-accent">space</span>
        </span>
      </Link>
      <div className="min-w-0 flex-1">
        <SpaceSwitcher />
      </div>
      {showReconnecting && (
        <span
          role="status"
          aria-live="polite"
          data-testid="reconnecting-badge"
          className="bg-warning/15 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-warning"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" aria-hidden="true" />
          Reconnecting...
        </span>
      )}
      <button
        type="button"
        aria-label={`Switch to ${effectiveMode === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${effectiveMode === 'dark' ? 'light' : 'dark'} mode`}
        onClick={toggleMode}
        className="rounded-button p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
      >
        {effectiveMode === 'dark' ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>
      <NotificationBell />
      <UserMenu />
    </header>
  );
};
