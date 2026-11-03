import type { RouteObject } from 'react-router-dom';
import { PublicOnlyRoute } from '@/app/router/guards';
import { AuthLayout } from '@/app/layouts';

export const authRoutes: RouteObject[] = [
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            lazy: () =>
              import('./pages/LoginPage').then((m) => ({
                Component: m.LoginPage,
              })),
          },
          {
            path: 'register',
            lazy: () =>
              import('./pages/RegisterPage').then((m) => ({
                Component: m.RegisterPage,
              })),
          },
        ],
      },
    ],
  },
];
