import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { createTask } from '../api/task.api';
import type { CreateTaskInput, Task } from '../types/task.types';

export function useCreateTask(): UseMutationResult<Task, Error, CreateTaskInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.bySpace(newTask.spaceId),
      });
      void queryClient.setQueryData(queryKeys.tasks.detail(newTask._id), newTask);
    },
  });
}
