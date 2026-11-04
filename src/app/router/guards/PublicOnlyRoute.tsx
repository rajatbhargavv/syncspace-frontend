import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/providers/useAuth';
import { Spinner } from '@/components/feedback/Spinner';
import { ROUTES } from '@/config/routes';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = state?.from?.pathname ?? ROUTES.OVERVIEW;
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
