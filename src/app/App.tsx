import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider, QueryProvider, SocketProvider, ThemeProvider } from './providers';
import { router } from './router';
import { ErrorBoundary } from './error-boundary/ErrorBoundary';
import { Toaster } from '@/components/feedback/Toaster';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <RouterProvider router={router} future={{ v7_startTransition: true }} />
              <Toaster />
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};
