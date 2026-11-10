import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { updateTask } from '../api/task.api';
import type { Task, UpdateTaskInput } from '../types/task.types';

export interface UpdateTaskVariables {
  id: string;
  data: UpdateTaskInput;
  spaceId?: string;
}

export function useUpdateTask(): UseMutationResult<Task, Error, UpdateTaskVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateTaskVariables) => updateTask(id, data),
    onSuccess: (updatedTask, { spaceId }) => {
      const targetSpaceId = spaceId ?? updatedTask.spaceId;
      if (targetSpaceId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.bySpace(targetSpaceId),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(updatedTask._id),
      });
      void queryClient.setQueryData(queryKeys.tasks.detail(updatedTask._id), updatedTask);
    },
  });
}
