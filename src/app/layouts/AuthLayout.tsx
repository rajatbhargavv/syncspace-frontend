import React from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-bg text-text">
      {/* Warm radial background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-accent opacity-20 blur-3xl"
        aria-hidden="true"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 sm:px-10">
        <Logo size="md" />
      </header>

      {/* Main card content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-text-muted">
        <p>&copy; {new Date().getFullYear()} SyncSpace. Collaborative task system.</p>
      </footer>
    </div>
  );
};
