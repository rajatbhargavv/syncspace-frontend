import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { disconnectSocket } from '@/lib/socket';
import { logout } from '../api/auth.api';

export function useLogout(): UseMutationResult<{ message: string }, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      disconnectSocket();
      queryClient.clear();
    },
  });
}
