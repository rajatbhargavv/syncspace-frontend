import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, formatRelative } from '@/lib/date';
import { Avatar, Badge, Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { CommentItem } from '../types/comment.types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useUpdateComment } from '../hooks/useUpdateComment';
import { useDeleteComment } from '../hooks/useDeleteComment';

export interface CommentCardProps {
  comment: CommentItem;
  currentUserId?: string;
  isSpaceOwner?: boolean;
  isTaskCreator?: boolean;
  activeMemberNames?: string[];
  disabled?: boolean;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  currentUserId,
  isSpaceOwner,
  isTaskCreator,
  activeMemberNames = [],
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const authorId =
    typeof comment.userId === 'object' ? comment.userId._id : comment.author?._id || comment.userId;
  const authorName = comment.author?.name || 'Member';
  const isOwn = Boolean(currentUserId && authorId === currentUserId);
  const isSending = comment.isSending;

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content || updateComment.isPending) {
      setIsEditing(false);
      return;
    }
    await updateComment.mutateAsync({
      taskId: comment.taskId,
      commentId: comment._id,
      content: trimmed,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (disabled || isSending || deleteComment.isPending) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    deleteComment.mutate({
      taskId: comment.taskId,
      commentId: comment._id,
    });
  };

  return (
    <article
      data-testid={`comment-${comment._id}`}
      className={`relative flex gap-3 ${isSending ? 'opacity-70' : ''}`}
      aria-label={`Comment by ${authorName}`}
    >
      {/* Author Avatar on the left */}
      <div className="relative z-10 flex-shrink-0">
        <Avatar name={authorName} size="sm" />
      </div>

      {/* GitHub PR style Comment Box */}
      <div className="flex-1 overflow-hidden rounded-card border border-border bg-surface shadow-card transition-colors">
        {/* Header strip */}
        <header className="bg-surface-hover/50 flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {authorId ? (
              <Link
                to={ROUTES.profile(authorId)}
                className="font-semibold text-text hover:text-accent"
              >
                {authorName}
              </Link>
            ) : (
              <span className="font-semibold text-text">{authorName}</span>
            )}

            {isSpaceOwner && (
              <Badge variant="default" size="sm">
                Owner
              </Badge>
            )}
            {!isSpaceOwner && isTaskCreator && (
              <Badge variant="outline" size="sm">
                Author
              </Badge>
            )}

            <span className="text-text-muted">
              {isSending ? (
                'commenting...'
              ) : (
                <>
                  commented{' '}
                  <time
                    dateTime={new Date(comment.createdAt).toISOString()}
                    title={formatDateTime(comment.createdAt)}
                    className="hover:underline"
                  >
                    {formatRelative(comment.createdAt)}
                  </time>
                </>
              )}
            </span>

            {comment.edited && (
              <span
                className="text-text-muted/80 text-[11px]"
                title={`Edited at ${formatDateTime(comment.updatedAt)}`}
              >
                • edited
              </span>
            )}
          </div>

          {/* Action buttons for owner */}
          {isOwn && !disabled && !isSending && !isEditing && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditContent(comment.content);
                  setIsEditing(true);
                }}
                className="rounded px-1.5 py-0.5 text-xs text-text-muted hover:bg-surface-hover hover:text-text"
                aria-label="Edit comment"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="hover:bg-error/10 rounded px-1.5 py-0.5 text-xs text-text-muted hover:text-error"
                aria-label="Delete comment"
              >
                Delete
              </button>
            </div>
          )}
        </header>

        {/* Content body */}
        <div className="p-3.5">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full resize-y rounded-input border border-border bg-bg p-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                aria-label="Edit comment content"
              />
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{editContent.length} / 2000</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditContent(comment.content);
                      setIsEditing(false);
                    }}
                    disabled={updateComment.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={
                      !editContent.trim() ||
                      editContent.trim() === comment.content ||
                      updateComment.isPending
                    }
                  >
                    {updateComment.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <MarkdownRenderer content={comment.content} activeMemberNames={activeMemberNames} />
          )}
        </div>
      </div>
    </article>
  );
};
