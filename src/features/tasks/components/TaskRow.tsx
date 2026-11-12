import React from 'react';
import { Avatar, Badge, Select } from '@/components/ui';
import { useMemberLookup } from '../hooks/useMemberLookup';
import { formatDeadline, isOverdue, priorityMeta, statusMeta } from '../utils/taskUtils';
import type { Task, TaskProgressStatus } from '../types/task.types';

export interface TaskRowProps {
  task: Task;
  spaceId: string;
  kind: Parameters<typeof statusMeta>[0];
  onOpen: () => void;
  onStatusChange: (status: TaskProgressStatus) => void;
  disabled?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  spaceId,
  kind,
  onOpen,
  onStatusChange,
  disabled = false,
}) => {
  const { getName } = useMemberLookup(spaceId);
  const meta = statusMeta(kind);
  const priority = priorityMeta[task.priority];
  const overdue = isOverdue(task);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      onKeyUp={() => undefined}
      className="border-border/60 hover:bg-surface-hover/50 grid cursor-pointer gap-3 border-b px-4 py-4 transition-colors md:grid-cols-[minmax(0,2fr)_140px_130px_120px] md:items-center"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">{task.title}</p>
        {task.description && (
          <p className="mt-1 truncate text-xs text-text-muted">{task.description}</p>
        )}
      </div>
      <Select
        aria-label={`Status for ${task.title}`}
        value={task.progressStatus}
        options={Object.values(meta).map((item) => ({ value: item.status, label: item.label }))}
        onChange={(event) => onStatusChange(event.target.value as TaskProgressStatus)}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        disabled={disabled}
        className="py-1.5 text-xs"
      />
      <Badge variant={priority.badgeVariant} size="sm" className="w-fit">
        {priority.label}
      </Badge>
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex -space-x-2" aria-label="Assignees">
          {task.assignees.slice(0, 3).map((assignee) => (
            <Avatar
              key={assignee.userId}
              name={getName(assignee.userId)}
              size="xs"
              className="ring-2 ring-surface"
            />
          ))}
          {task.assignees.length === 0 && <span className="text-text-muted">Unassigned</span>}
        </div>
        <span className={overdue ? 'font-semibold text-error' : 'text-text-muted'}>
          {formatDeadline(task.deadline)}
        </span>
      </div>
      <span className="text-xs text-text-muted md:hidden">
        Created by {getName(task.createdBy)}
      </span>
    </div>
  );
};
