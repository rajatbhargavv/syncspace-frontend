import React from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

export const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-bg text-text">
      <header className="border-border/50 flex items-center justify-between border-b px-6 py-4">
        <Logo size="sm" />
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
