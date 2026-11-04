import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { registerAuthFailureHandler } from '@/lib/http/refresh';
import { queryKeys } from '@/lib/queryKeys';
import { disconnectSocket } from '@/lib/socket';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { AuthContext } from './AuthContext';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading, refetch } = useCurrentUser();
  const logoutMutation = useLogout();

  // Register single-flight refresh failure handler
  useEffect(() => {
    const unregister = registerAuthFailureHandler(() => {
      disconnectSocket();
      queryClient.setQueryData(queryKeys.auth.me(), null);
    });
    return unregister;
  }, [queryClient]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.setQueryData(queryKeys.auth.me(), null);
    }
  };

  const handleRefetch = async () => {
    await refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: Boolean(user),
        isLoading,
        logout: handleLogout,
        refetchUser: handleRefetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
