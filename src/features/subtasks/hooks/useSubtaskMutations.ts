import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { createSubtask, updateSubtask, deleteSubtask } from '../api/subtask.api';
import type { Subtask, CreateSubtaskInput, UpdateSubtaskInput } from '../types/subtask.types';

export function useCreateSubtask(): UseMutationResult<Subtask, Error, CreateSubtaskInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, ...data }: CreateSubtaskInput) => createSubtask(taskId, data),
    onSuccess: (newSubtask) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.subtasks.byTask(newSubtask.taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(newSubtask.taskId),
      });
    },
  });
}

export interface UpdateSubtaskVariables {
  id: string;
  taskId: string;
  data: UpdateSubtaskInput;
}

export function useUpdateSubtask(): UseMutationResult<Subtask, Error, UpdateSubtaskVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateSubtaskVariables) => updateSubtask(id, data),
    onSuccess: (updatedSubtask, { taskId }) => {
      const targetTaskId = taskId || updatedSubtask.taskId;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.subtasks.byTask(targetTaskId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(targetTaskId),
      });
    },
  });
}

export interface DeleteSubtaskVariables {
  id: string;
  taskId: string;
}

export function useDeleteSubtask(): UseMutationResult<Subtask, Error, DeleteSubtaskVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteSubtaskVariables) => deleteSubtask(id),
    onSuccess: (_deleted, { taskId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.subtasks.byTask(taskId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId),
      });
    },
  });
}
