import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences, notifications, theme defaults, and subscription plan."
      />
      <EmptyState
        title="Coming in a later phase"
        description="User settings and preferences will be available in Phase 2."
      />
    </div>
  );
};
