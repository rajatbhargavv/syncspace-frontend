import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { register } from '../api/auth.api';
import type { AuthResponse, RegisterInput } from '../types/auth.types';

export function useRegister(): UseMutationResult<AuthResponse, Error, RegisterInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
