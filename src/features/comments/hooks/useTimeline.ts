import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getTimeline } from '../api/comment.api';
import type { TimelineItem } from '../types/comment.types';

export function useTimeline(taskId: string): UseQueryResult<TimelineItem[]> {
  return useQuery({
    queryKey: queryKeys.comments.timeline(taskId),
    queryFn: () => getTimeline(taskId),
    enabled: Boolean(taskId),
  });
}
