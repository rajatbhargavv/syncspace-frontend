import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button, EmptyState, ErrorState, Input, Select, Skeleton } from '@/components/ui';
import { useMemberLookup } from '@/features/tasks';
import { useSubtasks } from '../hooks/useSubtasks';
import { useDeleteSubtask, useUpdateSubtask } from '../hooks/useSubtaskMutations';
import { SubtaskForm } from './SubtaskForm';
import type { Subtask, SubtaskStatus } from '../types/subtask.types';

export interface SubtaskListProps {
  taskId: string;
  spaceId: string;
  readOnly?: boolean;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ taskId, spaceId, readOnly = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const subtasks = useSubtasks(taskId);
  const done = (subtasks.data ?? []).filter((subtask) => subtask.status === 'DONE').length;
  const listEmpty = (subtasks.data?.length ?? 0) === 0;

  return (
    <section aria-label="Subtasks" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text">Subtasks</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {done}/{subtasks.data?.length ?? 0} done
          </span>
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm((v) => !v)}
              className="h-6 px-2 text-xs"
            >
              {showAddForm ? 'Cancel' : '+ Add subtask'}
            </Button>
          )}
        </div>
      </div>
      {subtasks.isLoading ? <Skeleton className="h-24" /> : null}
      {subtasks.isError ? (
        <ErrorState message="Unable to load subtasks." onRetry={() => void subtasks.refetch()} />
      ) : null}
      {!subtasks.isLoading && !subtasks.isError && listEmpty && !showAddForm ? (
        <EmptyState title="No subtasks" description="Break this task into smaller steps." />
      ) : null}
      <div className="space-y-2">
        {subtasks.data?.map((subtask) => (
          <SubtaskItem key={subtask._id} subtask={subtask} spaceId={spaceId} readOnly={readOnly} />
        ))}
      </div>
      {!readOnly && (showAddForm || listEmpty) && (
        <div className="bg-surface-hover/20 rounded-card border border-border p-3">
          <SubtaskForm taskId={taskId} spaceId={spaceId} onCreated={() => setShowAddForm(false)} />
        </div>
      )}
    </section>
  );
};

interface SubtaskItemProps {
  subtask: Subtask;
  spaceId: string;
  readOnly: boolean;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({ subtask, spaceId, readOnly }) => {
  const { getName } = useMemberLookup(spaceId);
  const update = useUpdateSubtask();
  const remove = useDeleteSubtask();
  const statuses: { value: SubtaskStatus; label: string }[] = [
    { value: 'TODO', label: 'To do' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'DONE', label: 'Done' },
  ];
  const save = (data: { title?: string; status?: SubtaskStatus }) =>
    update.mutate(
      { id: subtask._id, taskId: subtask.taskId, data },
      { onError: (error) => toast.error(error.message) },
    );

  return (
    <div className="space-y-2 rounded-input border border-border p-3">
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          aria-label={`Mark ${subtask.title} done`}
          checked={subtask.status === 'DONE'}
          disabled={readOnly || update.isPending}
          onChange={(event) => save({ status: event.target.checked ? 'DONE' : 'TODO' })}
        />
        <Input
          aria-label="Subtask title"
          defaultValue={subtask.title}
          disabled={readOnly || update.isPending}
          onBlur={(event) => {
            if (event.target.value.trim() && event.target.value.trim() !== subtask.title)
              save({ title: event.target.value.trim() });
          }}
        />
        {!readOnly && (
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Delete ${subtask.title}`}
            onClick={() => {
              if (window.confirm(`Delete "${subtask.title}"?`)) {
                remove.mutate(
                  { id: subtask._id, taskId: subtask.taskId },
                  { onError: (error) => toast.error(error.message) },
                );
              }
            }}
          >
            Delete
          </Button>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Select
          label="Status"
          options={statuses}
          value={subtask.status}
          disabled={readOnly || update.isPending}
          onChange={(event) => save({ status: event.target.value as SubtaskStatus })}
        />
        <p className="self-end pb-2 text-xs text-text-muted">
          Assigned to {getName(subtask.assigneeId)}
        </p>
      </div>
    </div>
  );
};
