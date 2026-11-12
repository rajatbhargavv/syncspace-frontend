import React from 'react';
import { toast } from 'sonner';
import { Badge, Button, Dialog, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useSubtasks } from '../hooks/useSubtasks';
import { useDeleteSubtask, useUpdateSubtask } from '../hooks/useSubtaskMutations';
import { SubtaskForm } from './SubtaskForm';
import type { Subtask, SubtaskStatus } from '../types/subtask.types';

export interface SubtasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  spaceId: string;
  taskTitle: string;
  readOnly?: boolean;
}

export const SubtasksModal: React.FC<SubtasksModalProps> = ({
  isOpen,
  onClose,
  taskId,
  spaceId,
  taskTitle,
  readOnly = false,
}) => {
  const subtasksQuery = useSubtasks(taskId);
  const update = useUpdateSubtask();
  const remove = useDeleteSubtask();
  const subtasks = subtasksQuery.data ?? [];
  const completedCount = subtasks.filter((s) => s.status === 'DONE').length;

  const handleToggle = (subtask: Subtask) => {
    const nextStatus: SubtaskStatus = subtask.status === 'DONE' ? 'TODO' : 'DONE';
    update.mutate(
      { id: subtask._id, taskId, data: { status: nextStatus } },
      {
        onError: (error) => toast.error(error.message || 'Unable to update subtask'),
      },
    );
  };

  const handleDelete = (subtask: Subtask) => {
    if (!window.confirm(`Delete "${subtask.title}"?`)) return;
    remove.mutate(
      { id: subtask._id, taskId },
      {
        onSuccess: () => toast.success('Subtask deleted'),
        onError: (error) => toast.error(error.message || 'Unable to delete subtask'),
      },
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Subtasks"
      description={taskTitle}
      size="lg"
      className="max-h-[85vh] overflow-y-auto"
    >
      <div className="space-y-5">
        {/* Progress summary */}
        <div className="bg-surface-hover/30 flex items-center justify-between rounded-card border border-border p-3">
          <span className="text-xs font-medium text-text-muted">
            {completedCount} of {subtasks.length} completed
          </span>
          <div className="h-2 w-32 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{
                width: subtasks.length > 0 ? `${(completedCount / subtasks.length) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Loading / Error / Empty / List states */}
        {subtasksQuery.isLoading && <Skeleton className="h-32" />}
        {subtasksQuery.isError && (
          <ErrorState
            message="Unable to load subtasks."
            onRetry={() => void subtasksQuery.refetch()}
          />
        )}
        {!subtasksQuery.isLoading && !subtasksQuery.isError && subtasks.length === 0 && (
          <EmptyState
            title="No subtasks yet"
            description="Break down this task with smaller action items."
          />
        )}

        {subtasks.length > 0 && (
          <div className="space-y-2">
            {subtasks.map((subtask) => {
              const isDone = subtask.status === 'DONE';
              return (
                <div
                  key={subtask._id}
                  className="hover:bg-surface-hover/50 flex items-center justify-between gap-3 rounded-input border border-border bg-surface p-3 transition-colors"
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isDone}
                      disabled={readOnly || update.isPending}
                      onChange={() => handleToggle(subtask)}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                    />
                    <span
                      className={`truncate text-sm font-medium ${
                        isDone ? 'text-text-muted line-through' : 'text-text'
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </label>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant={
                        isDone
                          ? 'success'
                          : subtask.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'outline'
                      }
                      size="sm"
                    >
                      {subtask.status === 'DONE'
                        ? 'Done'
                        : subtask.status === 'IN_PROGRESS'
                          ? 'In progress'
                          : 'To do'}
                    </Badge>

                    {!readOnly && (
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete ${subtask.title}`}
                        onClick={() => handleDelete(subtask)}
                        disabled={remove.isPending}
                        className="text-text-muted hover:text-error"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form to add new subtask */}
        {!readOnly && (
          <div className="border-t border-border pt-4">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Add subtask
            </h4>
            <SubtaskForm taskId={taskId} spaceId={spaceId} />
          </div>
        )}
      </div>
    </Dialog>
  );
};
