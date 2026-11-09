import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const OverviewPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Your team activity, active tasks, and personal spaces summary."
      />
      <EmptyState
        title="Welcome to SyncSpace"
        description="Overview dashboard is being built by Member 2."
      />
    </div>
  );
};

