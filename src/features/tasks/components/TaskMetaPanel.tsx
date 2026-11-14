import React from 'react';
import { toast } from 'sonner';
import { Select, Input, TagInput } from '@/components/ui';
import { useUpdateTask } from '../hooks/useUpdateTask';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import { useMemberLookup } from '../hooks/useMemberLookup';
import { formatDeadline, isOverdue, priorityMeta, statusMeta } from '../utils/taskUtils';
import type { Task, TaskPriority, TaskProgressStatus } from '../types/task.types';
import type { SpaceKind } from '@/features/spaces';

export interface TaskMetaPanelProps {
  task: Task;
  spaceKind: SpaceKind;
  readOnly?: boolean;
}

const priorityOptions = (Object.keys(priorityMeta) as TaskPriority[]).map((value) => ({
  value,
  label: priorityMeta[value].label,
}));

export const TaskMetaPanel: React.FC<TaskMetaPanelProps> = ({
  task,
  spaceKind,
  readOnly = false,
}) => {
  const update = useUpdateTask();
  const updateStatus = useUpdateTaskStatus();
  const { getName } = useMemberLookup(task.spaceId);
  const statuses = statusMeta(spaceKind);
  const statusOptions = (Object.keys(statuses) as TaskProgressStatus[]).map((value) => ({
    value,
    label: statuses[value].label,
  }));
  const save = (data: { priority?: TaskPriority; deadline?: string }) => {
    update.mutate(
      { id: task._id, data, spaceId: task.spaceId },
      { onError: (error) => toast.error(error.message || 'Unable to update task') },
    );
  };
  const saveTags = (tags: string[]) => {
    update.mutate(
      { id: task._id, data: { tags }, spaceId: task.spaceId },
      {
        onSuccess: () => toast.success('Tags updated'),
        onError: (error) => toast.error(error.message || 'Unable to update tags'),
      },
    );
  };

  return (
    <section aria-label="Task metadata" className="space-y-3 rounded-card border border-border p-4">
      <Select
        label="Task status"
        options={statusOptions}
        value={task.progressStatus}
        disabled={readOnly || updateStatus.isPending}
        onChange={(event) =>
          updateStatus.mutate(
            {
              taskId: task._id,
              progressStatus: event.target.value as TaskProgressStatus,
              spaceId: task.spaceId,
            },
            { onError: (error) => toast.error(error.message || 'Unable to update status') },
          )
        }
      />
      <TagInput
        label="Tags"
        placeholder="e.g. inventory module..."
        value={task.tags ?? []}
        onChange={saveTags}
        disabled={readOnly || update.isPending}
        helperText={readOnly ? undefined : 'Classify task by module or category (press Enter)'}
      />
      <Select
        label="Priority"
        options={priorityOptions}
        value={task.priority}
        disabled={readOnly || update.isPending}
        onChange={(event) => save({ priority: event.target.value as TaskPriority })}
      />
      <Input
        label="Deadline"
        type="datetime-local"
        value={task.deadline.slice(0, 16)}
        disabled={readOnly || update.isPending}
        onChange={(event) => {
          if (event.target.value) save({ deadline: new Date(event.target.value).toISOString() });
        }}
      />
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-text-muted">Created by</dt>
          <dd className="font-medium text-text">{getName(task.createdBy)}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Created</dt>
          <dd className="font-medium text-text">{new Date(task.createdAt).toLocaleDateString()}</dd>
        </div>
      </dl>
      <p className={isOverdue(task) ? 'text-xs font-medium text-error' : 'text-xs text-text-muted'}>
        {isOverdue(task) ? 'Overdue: ' : 'Due: '}
        {formatDeadline(task.deadline)}
      </p>
    </section>
  );
};
