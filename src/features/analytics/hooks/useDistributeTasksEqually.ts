import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { distributeTasksEqually } from '../api/analytics.api';
import type { AnalyticsRange } from '../types/analytics.types';

export function useDistributeTasksEqually(spaceId: string, range: AnalyticsRange) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => distributeTasksEqually(spaceId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.bySpace(spaceId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.bySpace(spaceId, range),
      });
      void queryClient.invalidateQueries({
        queryKey: [...queryKeys.analytics.bySpace(spaceId, range), 'distribution-undo'],
      });
    },
  });
}
