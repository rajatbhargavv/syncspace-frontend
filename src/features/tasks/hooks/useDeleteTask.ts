import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { deleteTask } from '../api/task.api';
import type { Task } from '../types/task.types';

export interface DeleteTaskVariables {
  taskId: string;
  spaceId: string;
}

export function useDeleteTask(): UseMutationResult<Task, Error, DeleteTaskVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: DeleteTaskVariables) => deleteTask(taskId),
    onSuccess: (deletedTask, { spaceId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.bySpace(spaceId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.tasks.detail(deletedTask._id),
      });
    },
  });
}
