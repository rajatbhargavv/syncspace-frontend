import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { updateComment } from '../api/comment.api';
import type { CommentItem, TimelineItem } from '../types/comment.types';

export interface UpdateCommentVariables {
  taskId: string;
  commentId: string;
  content: string;
}

interface UpdateCommentContext {
  previousTimeline?: TimelineItem[];
}

export function useUpdateComment(): UseMutationResult<
  CommentItem,
  Error,
  UpdateCommentVariables,
  UpdateCommentContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, content }) => updateComment(commentId, { content }),
    onMutate: async ({ taskId, commentId, content }) => {
      const timelineKey = queryKeys.comments.timeline(taskId);
      await queryClient.cancelQueries({ queryKey: timelineKey });
      const previousTimeline = queryClient.getQueryData<TimelineItem[]>(timelineKey);

      queryClient.setQueryData<TimelineItem[]>(timelineKey, (old = []) =>
        old.map((item) => {
          if (item.kind === 'comment' && item._id === commentId) {
            return {
              ...item,
              content,
              edited: true,
              updatedAt: new Date().toISOString(),
            };
          }
          return item;
        }),
      );

      return { previousTimeline };
    },
    onError: (error, { taskId }, context) => {
      if (context?.previousTimeline) {
        queryClient.setQueryData(queryKeys.comments.timeline(taskId), context.previousTimeline);
      }
      toast.error(error.message || 'Failed to update comment');
    },
    onSuccess: (_updated, { taskId }) => {
      toast.success('Comment updated');
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.timeline(taskId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) });
    },
  });
}
