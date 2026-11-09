import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const CreateSpacePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Space"
        description="Choose a template, personalize theme tokens, and set membership rules."
      />
      <EmptyState
        title="Create Space Flow"
        description="Multi-kind space creator is being built by Member 3."
      />
    </div>
  );
};

