import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { AppLayout } from '@/app/layouts/AppLayout';
import { DashboardOverview } from '@/app/pages/DashboardOverview';
import { authRoutes } from '@/features/auth/routes';
import { ROUTES } from '@/config/routes';
import { EmptyState } from '@/components/ui/EmptyState';

export const router = createBrowserRouter(
  [
    // Auth routes (/login, /register)
    ...authRoutes,

    // Protected App routes
    {
      path: 'app',
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            {
              index: true,
              element: <DashboardOverview />,
            },
            {
              path: 'spaces',
              element: (
                <div className="p-8">
                  <h1 className="mb-2 font-heading text-2xl font-bold">Spaces</h1>
                  <p className="text-text-muted">Your active spaces will appear here.</p>
                </div>
              ),
            },
          ],
        },
      ],
    },

    // Root redirect
    {
      path: '/',
      element: <Navigate to={ROUTES.OVERVIEW} replace />,
    },

    // 404 Catch-all
    {
      path: '*',
      element: (
        <div className="flex h-screen w-full items-center justify-center bg-bg p-6 text-text">
          <EmptyState
            title="Page Not Found"
            description="The page you are looking for doesn't exist or has been moved."
            actionLabel="Return Home"
            onAction={() => {
              window.location.href = ROUTES.HOME;
            }}
          />
        </div>
      ),
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
