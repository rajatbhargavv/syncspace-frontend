import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { useLogout } from '@/features/auth';
import { useInstallPrompt } from '@/features/push';
import { Avatar, PlanBadge } from '@/components/ui';

export const UserMenu: React.FC = () => {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!user) return null;
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-button p-1.5 hover:bg-surface-hover">
        <Avatar name={user.name} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-medium text-text sm:block">
          {user.name}
        </span>
        <PlanBadge plan={user.plan} />
      </summary>
      <div className="absolute right-0 top-full z-dropdown mt-2 w-48 rounded-card border border-border bg-surface py-1 shadow-elevated">
        <Link
          to={ROUTES.profile(user._id)}
          className="block px-3 py-2 text-sm text-text hover:bg-surface-hover"
        >
          Profile
        </Link>
        <Link
          to={ROUTES.settings}
          className="block px-3 py-2 text-sm text-text hover:bg-surface-hover"
        >
          Settings
        </Link>
        {isInstallable && (
          <button
            type="button"
            onClick={(e) => {
              // Close details dropdown
              const details = e.currentTarget.closest('details');
              if (details) details.removeAttribute('open');
              void promptInstall();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text hover:bg-surface-hover"
          >
            <span aria-hidden="true">📱</span>
            Install app
          </button>
        )}
        <button
          type="button"
          disabled={logoutMutation.isPending}
          onClick={() => void logoutMutation.mutateAsync().then(() => navigate(ROUTES.LOGIN))}
          className="hover:bg-error/10 w-full px-3 py-2 text-left text-sm text-error"
        >
          Log out
        </button>
      </div>
    </details>
  );
};
