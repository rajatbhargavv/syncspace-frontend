// ── Comments Feature Public API ──

export type {
  CommentAuthor,
  CommentItem,
  ActivityEventType,
  EventActor,
  EventItem,
  TimelineItem,
  CreateCommentInput,
  UpdateCommentInput,
  CommentResponse,
  TimelineResponse,
  CommentsListResponse,
} from './types/comment.types';

export { commentSchema, type CommentFormValues } from './schemas/comment.schema';

export {
  getTimeline,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from './api/comment.api';
