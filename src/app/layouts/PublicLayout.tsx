import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [routeAnnouncement, setRouteAnnouncement] = useState('');
  const title = location.pathname.startsWith('/u/') ? 'Profile' : 'Public space';
  useDocumentTitle(title);

  useEffect(() => {
    setRouteAnnouncement(`${title} page`);
  }, [title]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg text-text">
      <header className="border-border/50 flex items-center justify-between border-b px-6 py-4">
        <Logo size="sm" />
      </header>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {routeAnnouncement}
      </div>
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
    </div>
  );
};
