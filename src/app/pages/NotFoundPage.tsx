import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { ROUTES } from '@/config/routes';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-6">
      <EmptyState
        title="Page Not Found"
        description="The page you are looking for doesn't exist, has been removed, or you don't have access."
        actionLabel="Return to Overview"
        onAction={() => navigate(ROUTES.OVERVIEW)}
      />
    </div>
  );
};
