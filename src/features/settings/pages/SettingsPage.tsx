import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SettingsNotificationSection } from '@/features/push';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences, notifications, theme defaults, and subscription plan."
      />
      <div className="max-w-3xl space-y-6">
        <SettingsNotificationSection />
      </div>
    </div>
  );
};
