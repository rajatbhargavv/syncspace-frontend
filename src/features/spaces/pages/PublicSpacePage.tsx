import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';

export const PublicSpacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <PageHeader
        title="Public Space Preview"
        description={`Explore public tasks and contributors for space ID: ${id ?? ''}`}
      />
      <EmptyState
        title="Public Space View"
        description="Public space preview and join request flow are being built by Member 4."
      />
    </div>
  );
};

