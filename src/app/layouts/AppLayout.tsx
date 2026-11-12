import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileNav, Sidebar, Topbar } from '@/components/layout';
import { useRealtimeSync } from '@/features/realtime';
import { InstallBanner, OfflineBanner, useServiceWorkerMessages } from '@/features/push';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const [routeAnnouncement, setRouteAnnouncement] = useState('');
  const routeTitle = getRouteTitle(location.pathname);
  useRealtimeSync();
  useServiceWorkerMessages();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  useDocumentTitle(routeTitle);

  useEffect(() => {
    setRouteAnnouncement(`${routeTitle} page`);
    mainRef.current?.focus();
  }, [location.pathname, routeTitle]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-text">
      <OfflineBanner />
      <InstallBanner />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden h-full shrink-0 md:flex">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar onOpenMenu={() => setIsMobileNavOpen(true)} />
          <a
            href="#main-content"
            className="sr-only z-tooltip rounded-button bg-accent px-3 py-2 text-sm text-text-inverse focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {routeAnnouncement}
          </div>
          <main
            ref={mainRef}
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-y-auto p-4 outline-none sm:p-6 md:p-8"
          >
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      </div>
    </div>
  );
};

function getRouteTitle(pathname: string): string {
  if (pathname === '/app') return 'Overview';
  if (pathname === '/spaces') return 'Spaces';
  if (pathname === '/spaces/new') return 'Create space';
  if (pathname.includes('/activity')) return 'Activity';
  if (pathname.startsWith('/spaces/')) return 'Space';
  if (pathname === '/my-tasks') return 'My tasks';
  if (pathname === '/notifications') return 'Notifications';
  if (pathname === '/settings') return 'Settings';
  if (pathname === '/upgrade') return 'Upgrade';
  return 'SyncSpace';
}
