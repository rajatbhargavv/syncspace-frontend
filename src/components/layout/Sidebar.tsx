import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { SpaceThemeDot, useSpaces } from '@/features/spaces';
import { Logo } from '@/components/ui/Logo';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/app/providers/useAuth';
import { PlanBadge } from '@/components/ui';

interface SidebarProps {
  onNavigate?: () => void;
  forceExpanded?: boolean;
}

const navItems = [
  { label: 'Overview', path: ROUTES.home, icon: '⌂' },
  { label: 'My tasks', path: ROUTES.myTasks, icon: '✓' },
  { label: 'Notifications', path: ROUTES.notifications, icon: '◌' },
  { label: 'Settings', path: ROUTES.settings, icon: '⚙' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, forceExpanded = false }) => {
  const { isSidebarCollapsed } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const spacesQuery = useSpaces();
  const spaces = spacesQuery.data?.filter((space) => space.status === 'Active') ?? [];
  const { user } = useAuth();
  const isCollapsed = forceExpanded ? false : isSidebarCollapsed;
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);
  useEffect(() => {
    const dismissedAt = Number(window.localStorage.getItem('syncspace-upgrade-dismissed-at'));
    setUpgradeDismissed(Number.isFinite(dismissedAt) && Date.now() - dismissedAt < 7 * 86400000);
  }, []);

  return (
    <aside
      aria-label="Primary navigation"
      className={`flex h-full flex-col border-r border-border bg-surface transition-[width] duration-200 motion-reduce:transition-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div
        className={`flex h-16 items-center border-b border-border px-5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        <Link to={ROUTES.home} aria-label="SyncSpace overview" onClick={onNavigate}>
          <Logo size="sm" showText={!isCollapsed} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isOverview = item.path === ROUTES.home;
            const isOverviewActive =
              isOverview &&
              (location.pathname === ROUTES.home || location.pathname === ROUTES.overview);

            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.path === ROUTES.home}
                onClick={onNavigate}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) => {
                  const active = isActive || isOverviewActive;
                  return `flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-accent-muted text-accent'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text'
                  } ${isCollapsed ? 'justify-center' : ''}`;
                }}
              >
                <span className="w-5 text-center text-base" aria-hidden="true">
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {!isCollapsed && (
          <section aria-labelledby="spaces-heading" className="mt-8">
            <div className="mb-2 flex items-center justify-between px-3">
              <h2
                id="spaces-heading"
                className="text-[11px] font-semibold uppercase tracking-wider text-text-muted"
              >
                Spaces
              </h2>
              <Link
                to={ROUTES.spaceNew}
                onClick={onNavigate}
                aria-label="Create a space"
                className="flex h-6 w-6 items-center justify-center rounded-full text-lg text-text-muted hover:bg-surface-hover hover:text-accent"
              >
                +
              </Link>
            </div>
            {spacesQuery.isLoading && (
              <div className="space-y-2 px-3" aria-label="Loading spaces">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-8 w-full" />
                ))}
              </div>
            )}
            {spacesQuery.isError && (
              <p className="px-3 text-xs text-error">
                Unable to load spaces.{' '}
                <button
                  type="button"
                  className="underline"
                  onClick={() => void spacesQuery.refetch()}
                >
                  Retry
                </button>
              </p>
            )}
            {!spacesQuery.isLoading && !spacesQuery.isError && spaces.length === 0 && (
              <EmptyState
                title="Create your first space"
                actionLabel="Create space"
                onAction={() => navigate(ROUTES.spaceNew)}
                className="border-0 bg-transparent p-3"
              />
            )}
            {!spacesQuery.isLoading && spaces.length > 0 && (
              <div className="space-y-1">
                {spaces.map((space) => {
                  const isActiveSpace = location.pathname === ROUTES.space(space._id);
                  return (
                    <Link
                      key={space._id}
                      to={ROUTES.space(space._id)}
                      onClick={onNavigate}
                      className={`flex items-center gap-2.5 rounded-button px-3 py-2 text-sm transition-colors ${
                        isActiveSpace
                          ? 'bg-accent-muted font-medium text-accent'
                          : 'text-text-muted hover:bg-surface-hover hover:text-text'
                      }`}
                    >
                      <SpaceThemeDot theme={space.theme} size="sm" />
                      <span className="min-w-0 flex-1 truncate">{space.name}</span>
                      <span className="text-[10px]">{space.memberCount}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </nav>
      {user?.plan === 'FREE' &&
        !upgradeDismissed &&
        !location.pathname.startsWith(ROUTES.upgrade) && (
          <div className="border-t border-border p-3">
            <div className="border-accent/30 relative rounded-card border bg-accent-muted p-3">
              <button
                type="button"
                aria-label="Dismiss upgrade offer"
                onClick={() => {
                  window.localStorage.setItem('syncspace-upgrade-dismissed-at', String(Date.now()));
                  setUpgradeDismissed(true);
                }}
                className="absolute right-1 top-1 text-xs text-text-muted hover:text-text"
              >
                ×
              </button>
              <Link to={ROUTES.upgrade} className="block">
                {!isCollapsed && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text">Upgrade to Pro</span>
                      <PlanBadge plan="PRO" />
                    </div>
                    <p className="mt-1 text-[11px] text-text-muted">Unlock Activity analytics.</p>
                  </>
                )}
                {isCollapsed && (
                  <span className="text-center text-xs font-bold text-accent">Pro</span>
                )}
              </Link>
            </div>
          </div>
        )}
    </aside>
  );
};
