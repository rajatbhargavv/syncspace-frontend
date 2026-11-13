import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getDistributionUndoStatus, undoTaskDistribution } from '../api/analytics.api';
import type { AnalyticsRange } from '../types/analytics.types';

export function useDistributionUndo(spaceId: string, range: AnalyticsRange, enabled: boolean) {
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    queryKey: [...queryKeys.analytics.bySpace(spaceId, range), 'distribution-undo'],
    queryFn: () => getDistributionUndoStatus(spaceId),
    enabled: Boolean(spaceId) && enabled,
  });
  const undoMutation = useMutation({
    mutationFn: () => undoTaskDistribution(spaceId),
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

  return { ...statusQuery, undoMutation };
}
