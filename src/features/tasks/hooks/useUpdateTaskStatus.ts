import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { updateTask } from '../api/task.api';
import type { Task, TaskProgressStatus } from '../types/task.types';

export interface UpdateTaskStatusVariables {
  taskId: string;
  spaceId: string;
  progressStatus: TaskProgressStatus;
}

interface UpdateTaskStatusContext {
  previousTasks?: Task[];
  previousTask?: Task;
  spaceId: string;
  taskId: string;
}

export function useUpdateTaskStatus(): UseMutationResult<
  Task,
  Error,
  UpdateTaskStatusVariables,
  UpdateTaskStatusContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, progressStatus }: UpdateTaskStatusVariables) =>
      updateTask(taskId, { progressStatus }),
    onMutate: async ({ taskId, spaceId, progressStatus }): Promise<UpdateTaskStatusContext> => {
      const spaceKey = queryKeys.tasks.bySpace(spaceId);
      const detailKey = queryKeys.tasks.detail(taskId);

      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: spaceKey });
      await queryClient.cancelQueries({ queryKey: detailKey });

      // Snapshot previous values
      const previousTasks = queryClient.getQueryData<Task[]>(spaceKey);
      const previousTask = queryClient.getQueryData<Task>(detailKey);

      // Optimistically update list
      queryClient.setQueryData<Task[]>(spaceKey, (old) => {
        if (!old) return old;
        return old.map((t) =>
          t._id === taskId ? { ...t, progressStatus, updatedAt: new Date().toISOString() } : t,
        );
      });

      // Optimistically update single task detail
      queryClient.setQueryData<Task>(detailKey, (old) => {
        if (!old) return old;
        return { ...old, progressStatus, updatedAt: new Date().toISOString() };
      });

      return { previousTasks, previousTask, spaceId, taskId };
    },
    onError: (err, _variables, context) => {
      // Roll back
      if (context) {
        if (context.previousTasks !== undefined) {
          queryClient.setQueryData(queryKeys.tasks.bySpace(context.spaceId), context.previousTasks);
        }
        if (context.previousTask !== undefined) {
          queryClient.setQueryData(queryKeys.tasks.detail(context.taskId), context.previousTask);
        }
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update task status');
    },
    onSettled: (_data, _error, { taskId, spaceId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.bySpace(spaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId),
      });
    },
  });
}
