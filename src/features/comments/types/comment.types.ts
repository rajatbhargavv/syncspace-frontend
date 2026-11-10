// ── Comment & Timeline Domain Types ──

export interface CommentAuthor {
  _id: string;
  name: string;
  avatarUrl?: string;
}

export interface CommentItem {
  kind: 'comment';
  _id: string;
  taskId: string;
  userId: string | CommentAuthor;
  author?: CommentAuthor;
  content: string;
  edited?: boolean;
  createdAt: string;
  updatedAt: string;
  isOptimistic?: boolean;
  isSending?: boolean;
}

export type ActivityEventType =
  | 'COMMENT_ADDED'
  | 'TASK_CREATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_UPDATED'
  | 'ASSIGNEE_ADDED'
  | 'ASSIGNEE_REMOVED'
  | 'ASSIGNEE_STATUS_CHANGED'
  | 'SUBTASK_CREATED'
  | 'SUBTASK_COMPLETED'
  | (string & {});

export interface EventActor {
  _id: string;
  name: string;
}

export interface EventItem {
  kind: 'event';
  _id: string;
  spaceId: string;
  taskId: string;
  actorId: string | EventActor;
  actor?: EventActor;
  type: ActivityEventType;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type TimelineItem = CommentItem | EventItem;

export interface CreateCommentInput {
  content: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CommentResponse {
  message?: string;
  comment: CommentItem;
}

export interface TimelineResponse {
  message?: string;
  timeline: TimelineItem[];
}

export interface CommentsListResponse {
  message?: string;
  comments: CommentItem[];
}
