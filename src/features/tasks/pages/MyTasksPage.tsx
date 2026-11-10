import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const MyTasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="Unified task inbox and priority list across all your spaces."
      />
      <EmptyState
        title="Coming in a later phase"
        description="Personal cross-space task management will be available in Phase 2."
      />
    </div>
  );
};
