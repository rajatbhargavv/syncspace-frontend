import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards/ProtectedRoute';
import { AppLayout, PublicLayout } from '@/app/layouts';
import { authRoutes } from '@/features/auth/routes';
import { ROUTES } from '@/config/routes';
import { NotFoundPage } from '@/app/pages/NotFoundPage';

export const router = createBrowserRouter(
  [
    // Auth routes (/login, /register)
    ...authRoutes,

    // Public space route (/s/:id) - no auth required
    {
      element: <PublicLayout />,
      children: [
        {
          path: 's/:id',
          lazy: () =>
            import('@/features/spaces/pages/PublicSpacePage').then((m) => ({
              Component: m.PublicSpacePage,
            })),
        },
      ],
    },

    // Protected App routes
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            {
              path: 'app',
              lazy: () =>
                import('@/features/overview/pages/OverviewPage').then((m) => ({
                  Component: m.OverviewPage,
                })),
            },
            {
              path: 'spaces',
              lazy: () =>
                import('@/features/spaces/pages/SpacesPage').then((m) => ({
                  Component: m.SpacesPage,
                })),
            },
            {
              path: 'spaces/new',
              lazy: () =>
                import('@/features/spaces/pages/CreateSpacePage').then((m) => ({
                  Component: m.CreateSpacePage,
                })),
            },
            {
              path: 'spaces/:id',
              lazy: () =>
                import('@/features/spaces/pages/SpaceOverviewPage').then((m) => ({
                  Component: m.SpaceOverviewPage,
                })),
            },
            {
              path: 'my-tasks',
              lazy: () =>
                import('@/features/tasks/pages/MyTasksPage').then((m) => ({
                  Component: m.MyTasksPage,
                })),
            },
            {
              path: 'notifications',
              lazy: () =>
                import('@/features/notifications/pages/NotificationsPage').then((m) => ({
                  Component: m.NotificationsPage,
                })),
            },
            {
              path: 'settings',
              lazy: () =>
                import('@/features/settings/pages/SettingsPage').then((m) => ({
                  Component: m.SettingsPage,
                })),
            },
          ],
        },
      ],
    },

    // Root redirect -> /app
    {
      path: '/',
      element: <Navigate to={ROUTES.OVERVIEW} replace />,
    },

    // 404 Catch-all
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
