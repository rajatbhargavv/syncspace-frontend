import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { createSpace } from '../api/space.api';
import type { CreateSpaceInput, Space } from '../types/space.types';

export function useCreateSpace(): UseMutationResult<Space, Error, CreateSpaceInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSpace,
    onSuccess: (newSpace) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.list() });
      void queryClient.setQueryData(queryKeys.spaces.byId(newSpace._id), newSpace);
    },
  });
}
