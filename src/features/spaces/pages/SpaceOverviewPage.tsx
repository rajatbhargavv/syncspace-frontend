import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const SpaceOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Space Details"
        description={`Active workspace view for space ID: ${id ?? ''}`}
      />
      <EmptyState
        title="Space Overview"
        description="Space workspace views, task boards, and member lists are being built by Member 4."
      />
    </div>
  );
};

