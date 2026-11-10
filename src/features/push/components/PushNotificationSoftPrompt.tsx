import React, { useState } from 'react';
import { NotchCard } from '@/components/ui/NotchCard';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { usePushNotifications } from '../hooks/usePushNotifications';

const SOFT_PROMPT_KEY = 'syncspace_push_soft_prompt_dismissed_at';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export const PushNotificationSoftPrompt: React.FC = () => {
  const { state, enable, isLoading } = usePushNotifications();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const dismissedAt = localStorage.getItem(SOFT_PROMPT_KEY);
      if (!dismissedAt) return false;
      const elapsed = Date.now() - Number.parseInt(dismissedAt, 10);
      return elapsed < FOURTEEN_DAYS_MS;
    } catch {
      return false;
    }
  });

  if (isDismissed || state !== 'default') {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(SOFT_PROMPT_KEY, Date.now().toString());
    } catch {
      // Ignored
    }
  };

  return (
    <NotchCard variant="custom" className="relative p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 pr-6">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🔔
            </span>
            <h3 className="font-heading text-base font-semibold text-text">
              Turn on notifications
            </h3>
          </div>
          <p className="text-sm text-text-muted">
            Never miss a mention, task assignment, or team update—even when SyncSpace is closed.
          </p>
        </div>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Dismiss notification prompt"
          onClick={handleDismiss}
        >
          ✕
        </IconButton>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" isLoading={isLoading} onClick={() => void enable()}>
          Enable notifications
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDismiss}>
          Maybe later
        </Button>
      </div>
    </NotchCard>
  );
};
