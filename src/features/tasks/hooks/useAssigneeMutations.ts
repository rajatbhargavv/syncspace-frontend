import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { addAssignee, removeAssignee, updateMyAssigneeStatus } from '../api/task.api';
import type { Task, AssigneeStatus } from '../types/task.types';

export interface AddAssigneeVariables {
  taskId: string;
  userId: string;
  spaceId?: string;
}

export function useAddAssignee(): UseMutationResult<Task, Error, AddAssigneeVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: AddAssigneeVariables) => addAssignee(taskId, userId),
    onSuccess: (updatedTask, { spaceId }) => {
      const targetSpace = spaceId ?? updatedTask.spaceId;
      if (targetSpace) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.bySpace(targetSpace),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(updatedTask._id),
      });
      void queryClient.setQueryData(queryKeys.tasks.detail(updatedTask._id), updatedTask);
    },
  });
}

export interface RemoveAssigneeVariables {
  taskId: string;
  userId: string;
  spaceId?: string;
}

export function useRemoveAssignee(): UseMutationResult<Task, Error, RemoveAssigneeVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, userId }: RemoveAssigneeVariables) => removeAssignee(taskId, userId),
    onSuccess: (updatedTask, { spaceId }) => {
      const targetSpace = spaceId ?? updatedTask.spaceId;
      if (targetSpace) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.bySpace(targetSpace),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(updatedTask._id),
      });
      void queryClient.setQueryData(queryKeys.tasks.detail(updatedTask._id), updatedTask);
    },
  });
}

export interface UpdateMyAssigneeStatusVariables {
  taskId: string;
  status: AssigneeStatus;
  spaceId?: string;
}

export function useUpdateMyAssigneeStatus(): UseMutationResult<
  Task,
  Error,
  UpdateMyAssigneeStatusVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: UpdateMyAssigneeStatusVariables) =>
      updateMyAssigneeStatus(taskId, status),
    onSuccess: (updatedTask, { spaceId }) => {
      const targetSpace = spaceId ?? updatedTask.spaceId;
      if (targetSpace) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.bySpace(targetSpace),
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(updatedTask._id),
      });
      void queryClient.setQueryData(queryKeys.tasks.detail(updatedTask._id), updatedTask);
    },
  });
}
