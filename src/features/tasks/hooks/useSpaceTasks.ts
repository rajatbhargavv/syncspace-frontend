import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getSpaceTasks, type GetSpaceTasksParams } from '../api/task.api';
import type { Task } from '../types/task.types';

export function useSpaceTasks(
  spaceId: string,
  params?: GetSpaceTasksParams,
): UseQueryResult<Task[]> {
  return useQuery({
    queryKey: queryKeys.tasks.bySpace(spaceId, params),
    queryFn: () => getSpaceTasks(spaceId, params),
    enabled: Boolean(spaceId),
  });
}
