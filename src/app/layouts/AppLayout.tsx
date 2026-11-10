import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNav, Sidebar, Topbar } from '@/components/layout';
import { useRealtimeSync } from '@/features/realtime';
import { InstallBanner, OfflineBanner, useServiceWorkerMessages } from '@/features/push';

export const AppLayout: React.FC = () => {
  useRealtimeSync();
  useServiceWorkerMessages();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <OfflineBanner />
      <InstallBanner />
      <div className="flex flex-1">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onOpenMenu={() => setIsMobileNavOpen(true)} />
          <a
            href="#main-content"
            className="sr-only z-tooltip rounded-button bg-accent px-3 py-2 text-sm text-text-inverse focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 md:p-8">
            <Outlet />
          </main>
        </div>
        <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
      </div>
    </div>
  );
};
