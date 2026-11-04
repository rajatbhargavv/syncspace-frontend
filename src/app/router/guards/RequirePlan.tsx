import React from 'react';
import { useAuth } from '@/app/providers/useAuth';
import { USER_PLAN } from '@/config/constants';
import { EmptyState } from '@/components/ui/EmptyState';

export interface RequirePlanProps {
  requiredPlan: (typeof USER_PLAN)[keyof typeof USER_PLAN];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequirePlan: React.FC<RequirePlanProps> = ({ requiredPlan, children, fallback }) => {
  const { user } = useAuth();

  if (requiredPlan === 'PRO' && user?.plan !== 'PRO') {
    if (fallback) return <>{fallback}</>;

    return (
      <EmptyState
        title="Pro Feature"
        description="This feature requires an active Pro subscription to view and use."
        actionLabel="Upgrade to Pro"
        onAction={() => {
          // Dev plan toggle or billing redirect
        }}
      />
    );
  }

  return <>{children}</>;
};
