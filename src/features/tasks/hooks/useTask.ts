import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getTaskById } from '../api/task.api';
import type { Task } from '../types/task.types';

export function useTask(taskId: string): UseQueryResult<Task> {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: () => getTaskById(taskId),
    enabled: Boolean(taskId),
  });
}
