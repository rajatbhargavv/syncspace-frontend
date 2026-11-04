import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { useTheme } from '@/app/providers/useTheme';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { ROUTES } from '@/config/routes';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg text-text">
      {/* Top navigation bar */}
      <header className="z-sticky border-border/60 bg-surface/80 sticky top-0 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
        </div>

        <div className="flex items-center gap-3">
          {/* Theme mode toggle */}
          <IconButton
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
            variant="ghost"
            size="sm"
            onClick={toggleMode}
            className="text-text-muted hover:text-text"
          >
            {mode === 'dark' ? (
              <svg
                className="h-4 w-4"
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
                className="h-4 w-4"
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
          </IconButton>

          {/* User profile & badge */}
          {user && (
            <div className="border-border/60 flex items-center gap-2.5 border-l pl-2">
              <Avatar name={user.name} size="sm" />
              <div className="hidden flex-col text-left sm:flex">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-text">{user.name}</span>
                  <Badge variant={user.plan === 'PRO' ? 'accent' : 'default'} size="sm">
                    {user.plan}
                  </Badge>
                </div>
                <span className="text-[11px] text-text-muted">{user.email}</span>
              </div>
            </div>
          )}

          {/* Logout button */}
          <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2 text-xs">
            Sign out
          </Button>
        </div>
      </header>

      {/* Main content view */}
      <main className="mx-auto w-full max-w-7xl flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
