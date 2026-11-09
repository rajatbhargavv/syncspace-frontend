import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const SpacesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Spaces"
        description="Collaborative task spaces for your family, dev team, studio, or personal workflows."
      />
      <EmptyState
        title="Spaces Directory"
        description="Spaces list and management are being built by Member 4."
      />
    </div>
  );
};

