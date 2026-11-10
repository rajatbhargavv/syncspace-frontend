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

export { useTimeline } from './hooks/useTimeline';
export { useCreateComment, type CreateCommentVariables } from './hooks/useCreateComment';
export { useUpdateComment, type UpdateCommentVariables } from './hooks/useUpdateComment';
export { useDeleteComment, type DeleteCommentVariables } from './hooks/useDeleteComment';

export { formatEventText, groupTimelineItems, type TimelineGroup } from './utils/timelineUtils';
export { EventTimelineItem, type EventTimelineItemProps } from './components/EventTimelineItem';
export { MarkdownRenderer, type MarkdownRendererProps } from './components/MarkdownRenderer';
export { CommentCard, type CommentCardProps } from './components/CommentCard';
export {
  MentionAutocomplete,
  type MentionAutocompleteProps,
  type MentionMember,
} from './components/MentionAutocomplete';
export { CommentComposer, type CommentComposerProps } from './components/CommentComposer';




