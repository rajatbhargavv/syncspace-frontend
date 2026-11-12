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
          <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
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
