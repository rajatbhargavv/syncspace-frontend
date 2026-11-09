import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { updateSpace } from '../api/space.api';
import type { Space, UpdateSpaceInput } from '../types/space.types';

export interface UpdateSpaceVariables {
  id: string;
  data: UpdateSpaceInput;
}

export function useUpdateSpace(): UseMutationResult<Space, Error, UpdateSpaceVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateSpaceVariables) => updateSpace(id, data),
    onSuccess: (updatedSpace) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.list() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.byId(updatedSpace._id) });
      void queryClient.setQueryData(queryKeys.spaces.byId(updatedSpace._id), updatedSpace);
    },
  });
}

