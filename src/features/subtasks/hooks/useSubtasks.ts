import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getSubtasks } from '../api/subtask.api';
import type { Subtask } from '../types/subtask.types';

export function useSubtasks(taskId: string): UseQueryResult<Subtask[]> {
  return useQuery({
    queryKey: queryKeys.subtasks.byTask(taskId),
    queryFn: () => getSubtasks(taskId),
    enabled: Boolean(taskId),
  });
}
