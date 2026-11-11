import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ApiError } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import { getSpaceAnalytics } from '../api/analytics.api';
import type { AnalyticsRange } from '../types/analytics.types';

export function useSpaceAnalytics(spaceId: string, range: AnalyticsRange) {
  const query = useQuery({
    queryKey: queryKeys.analytics.bySpace(spaceId, range),
    queryFn: () => getSpaceAnalytics(spaceId, range),
    enabled: Boolean(spaceId),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && [402, 403, 404].includes(error.status)) return false;
      return failureCount < 1;
    },
  });
  const isLocked = query.error instanceof ApiError && query.error.isPaymentRequired;
  const isEmpty =
    query.isSuccess &&
    query.data.tasksCompletedPerDay.every((point) => point.count === 0) &&
    query.data.completionByMember.every((member) => member.completedCount === 0) &&
    query.data.workloadPerMember.every((member) => member.activeTasksCount === 0);

  return {
    ...query,
    isLocked,
    isEmpty,
    state: isLocked ? 'locked' : query.isError ? 'error' : isEmpty ? 'empty' : 'ready',
  } as const;
}
