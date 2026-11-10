import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/useAuth';
import { queryKeys } from '@/lib/queryKeys';
import { createComment } from '../api/comment.api';
import type { CommentItem, TimelineItem } from '../types/comment.types';

export interface CreateCommentVariables {
  taskId: string;
  content: string;
  onErrorDraft?: (draft: string) => void;
}

interface CreateCommentContext {
  previousTimeline?: TimelineItem[];
  optimisticId: string;
}

export function useCreateComment(): UseMutationResult<
  CommentItem,
  Error,
  CreateCommentVariables,
  CreateCommentContext
> {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ taskId, content }) => createComment(taskId, { content }),
    onMutate: async ({ taskId, content }) => {
      const timelineKey = queryKeys.comments.timeline(taskId);
      await queryClient.cancelQueries({ queryKey: timelineKey });
      const previousTimeline = queryClient.getQueryData<TimelineItem[]>(timelineKey);

      const optimisticId = `temp-${Date.now()}`;
      const now = new Date().toISOString();

      const optimisticComment: CommentItem = {
        kind: 'comment',
        _id: optimisticId,
        taskId,
        userId: user?._id ?? 'me',
        author: {
          _id: user?._id ?? 'me',
          name: user?.name ?? 'You',
        },
        content,
        createdAt: now,
        updatedAt: now,
        isOptimistic: true,
        isSending: true,
      };

      queryClient.setQueryData<TimelineItem[]>(timelineKey, (old = []) => [
        ...old,
        optimisticComment,
      ]);

      return { previousTimeline, optimisticId };
    },
    onError: (error, { taskId, content, onErrorDraft }, context) => {
      if (context?.previousTimeline) {
        queryClient.setQueryData(queryKeys.comments.timeline(taskId), context.previousTimeline);
      }
      onErrorDraft?.(content);
      toast.error(error.message || 'Failed to post comment. Your draft was restored.');
    },
    onSuccess: (savedComment, { taskId }, context) => {
      const timelineKey = queryKeys.comments.timeline(taskId);

      // Ensure author is populated using current user fallback
      const authorFallback =
        typeof savedComment.userId === 'object'
          ? savedComment.userId
          : { _id: user?._id ?? 'me', name: user?.name ?? 'You' };

      const resolvedComment: CommentItem = {
        ...savedComment,
        kind: 'comment',
        author: savedComment.author ?? authorFallback,
        isOptimistic: false,
        isSending: false,
      };

      queryClient.setQueryData<TimelineItem[]>(timelineKey, (old = []) =>
        old.map((item) =>
          item.kind === 'comment' && item._id === context.optimisticId ? resolvedComment : item,
        ),
      );

      void queryClient.invalidateQueries({ queryKey: timelineKey });
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) });
    },
  });
}
