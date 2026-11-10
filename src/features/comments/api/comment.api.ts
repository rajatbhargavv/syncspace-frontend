import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type {
  CommentItem,
  CommentResponse,
  CommentsListResponse,
  CreateCommentInput,
  TimelineItem,
  TimelineResponse,
  UpdateCommentInput,
} from '../types/comment.types';

export async function getTimeline(taskId: string): Promise<TimelineItem[]> {
  const response = await http.get<TimelineResponse>(API_ENDPOINTS.TASKS.TIMELINE(taskId));
  return response.timeline;
}

export async function getComments(taskId: string): Promise<CommentItem[]> {
  const response = await http.get<CommentsListResponse>(API_ENDPOINTS.TASKS.COMMENTS(taskId));
  return response.comments;
}

export async function createComment(
  taskId: string,
  input: CreateCommentInput,
): Promise<CommentItem> {
  const response = await http.post<CommentResponse>(API_ENDPOINTS.TASKS.COMMENTS(taskId), input);
  return response.comment;
}

export async function updateComment(
  commentId: string,
  input: UpdateCommentInput,
): Promise<CommentItem> {
  const response = await http.patch<CommentResponse>(
    API_ENDPOINTS.COMMENTS.BY_ID(commentId),
    input,
  );
  return response.comment;
}

export async function deleteComment(commentId: string): Promise<CommentItem> {
  const response = await http.delete<CommentResponse>(API_ENDPOINTS.COMMENTS.BY_ID(commentId));
  return response.comment;
}
