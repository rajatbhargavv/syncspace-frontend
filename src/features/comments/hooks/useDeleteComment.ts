import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { deleteComment } from '../api/comment.api';
import type { CommentItem, TimelineItem } from '../types/comment.types';

export interface DeleteCommentVariables {
  taskId: string;
  commentId: string;
}

interface DeleteCommentContext {
  previousTimeline?: TimelineItem[];
}

export function useDeleteComment(): UseMutationResult<
  CommentItem,
  Error,
  DeleteCommentVariables,
  DeleteCommentContext
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }) => deleteComment(commentId),
    onMutate: async ({ taskId, commentId }) => {
      const timelineKey = queryKeys.comments.timeline(taskId);
      await queryClient.cancelQueries({ queryKey: timelineKey });
      const previousTimeline = queryClient.getQueryData<TimelineItem[]>(timelineKey);

      queryClient.setQueryData<TimelineItem[]>(timelineKey, (old = []) =>
        old.filter((item) => !(item.kind === 'comment' && item._id === commentId)),
      );

      return { previousTimeline };
    },
    onError: (error, { taskId }, context) => {
      if (context?.previousTimeline) {
        queryClient.setQueryData(queryKeys.comments.timeline(taskId), context.previousTimeline);
      }
      toast.error(error.message || 'Failed to delete comment');
    },
    onSuccess: (_deleted, { taskId }) => {
      toast.success('Comment deleted');
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.timeline(taskId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) });
    },
  });
}
