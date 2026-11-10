import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { socketActions } from '@/lib/socket';
import { deactivateSpace } from '../api/space.api';
import type { Space } from '../types/space.types';

export function useDeactivateSpace(): UseMutationResult<Space, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateSpace(id),
    onSuccess: (deactivatedSpace) => {
      socketActions.leaveSpace(deactivatedSpace._id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.list() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.spaces.byId(deactivatedSpace._id),
      });
      void queryClient.setQueryData(queryKeys.spaces.byId(deactivatedSpace._id), deactivatedSpace);
    },
  });
}
