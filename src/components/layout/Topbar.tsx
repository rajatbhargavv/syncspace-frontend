import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useUiStore } from '@/stores/uiStore';
import { SpaceSwitcher } from './SpaceSwitcher';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';

interface TopbarProps {
  onOpenMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMenu }) => {
  const { toggleSidebar } = useUiStore();
  return (
    <header className="bg-surface/90 flex h-16 items-center gap-3 border-b border-border px-4 backdrop-blur-md sm:px-6">
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
      <NotificationBell />
      <UserMenu />
    </header>
  );
};
