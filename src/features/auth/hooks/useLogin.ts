import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { login } from '../api/auth.api';
import type { AuthResponse, LoginInput } from '../types/auth.types';

export function useLogin(): UseMutationResult<AuthResponse, Error, LoginInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
