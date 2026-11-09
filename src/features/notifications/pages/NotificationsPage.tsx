import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated with task assignments, comments, and space activity."
      />
      <EmptyState
        title="Coming in a later phase"
        description="Full notification center with filtering and push delivery will be available in Phase 2."
      />
    </div>
  );
};

