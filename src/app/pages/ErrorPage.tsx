import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/routes';

export const ErrorPage: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected application error occurred.';

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-bg p-6 text-text">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-elevated text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-error/15 text-2xl text-error">
          ⚠️
        </div>
        <h1 className="font-heading text-xl font-bold text-text">Something went wrong</h1>
        <p className="text-sm text-text-muted">
          We encountered an unexpected error while loading this page.
        </p>

        <div className="rounded-lg bg-surface-hover/80 p-3 text-left border border-border/50 max-h-32 overflow-y-auto">
          <p className="text-xs font-mono text-error break-words">{errorMessage}</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.OVERVIEW)}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
