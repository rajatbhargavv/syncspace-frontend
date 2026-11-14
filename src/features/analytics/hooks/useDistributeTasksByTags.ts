import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { distributeTasksByTags, type TagDistributionMapping } from '../api/analytics.api';
import type { AnalyticsRange } from '../types/analytics.types';

export function useDistributeTasksByTags(spaceId: string, range?: AnalyticsRange) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mappings: TagDistributionMapping[]) => distributeTasksByTags(spaceId, mappings),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.bySpace(spaceId),
      });
      if (range) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.analytics.bySpace(spaceId, range),
        });
        void queryClient.invalidateQueries({
          queryKey: [...queryKeys.analytics.bySpace(spaceId, range), 'distribution-undo'],
        });
      } else {
        void queryClient.invalidateQueries({
          queryKey: ['analytics', spaceId],
        });
      }
    },
  });
}
