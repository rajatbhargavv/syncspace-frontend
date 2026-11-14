import React, { useState } from 'react';
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
  assigneeOptions: Array<{ value: string; label: string }>;
  canChangeAssignee: boolean;
  onAssigneeChange: (assigneeIds: string[]) => void;
  disabled?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  spaceId,
  kind,
  onOpen,
  onStatusChange,
  assigneeOptions,
  canChangeAssignee,
  onAssigneeChange,
  disabled = false,
}) => {
  const { getName } = useMemberLookup(spaceId);
  const meta = statusMeta(kind);
  const priority = priorityMeta[task.priority];
  const overdue = isOverdue(task);
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const selectedAssigneeIds = new Set(task.assignees.map((assignee) => assignee.userId));
  const assigneeLabel =
    task.assignees.length === 0
      ? 'Unassigned'
      : task.assignees.length === 1
        ? (assigneeOptions.find((option) => option.value === task.assignees[0]?.userId)?.label ??
          '1 assignee')
        : `${task.assignees.length} assignees`;

  const toggleAssignee = (assigneeId: string) => {
    const nextIds = new Set(selectedAssigneeIds);
    if (nextIds.has(assigneeId)) nextIds.delete(assigneeId);
    else nextIds.add(assigneeId);
    onAssigneeChange(Array.from(nextIds));
  };

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
      className="border-border/60 hover:bg-surface-hover/50 grid cursor-pointer gap-3 border-b px-4 py-4 transition-colors md:grid-cols-[minmax(0,2fr)_140px_130px_170px_120px] md:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-text">{task.title}</p>
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1" aria-label="Task tags">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="border-accent/25 bg-accent/10 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
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
      <div className="relative">
        <button
          type="button"
          aria-expanded={isAssigneeMenuOpen}
          aria-haspopup="menu"
          aria-label={`Assignees for ${task.title}`}
          disabled={disabled || !canChangeAssignee}
          onClick={(event) => {
            event.stopPropagation();
            setIsAssigneeMenuOpen((isOpen) => !isOpen);
          }}
          onKeyDown={(event) => event.stopPropagation()}
          className="w-full rounded-input border border-border bg-surface px-3 py-1.5 text-left text-xs text-text transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block truncate">{assigneeLabel}</span>
        </button>
        {isAssigneeMenuOpen && (
          <div
            role="menu"
            aria-label={`Select assignees for ${task.title}`}
            className="absolute left-0 top-full z-20 mt-1 max-h-52 w-full min-w-44 overflow-y-auto rounded-input border border-border bg-surface p-1 shadow-card"
          >
            {assigneeOptions.map((option) => (
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={selectedAssigneeIds.has(option.value)}
                key={option.value}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleAssignee(option.value);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-text hover:bg-surface-hover"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                    selectedAssigneeIds.has(option.value)
                      ? 'border-accent bg-accent text-white'
                      : 'border-border'
                  }`}
                >
                  {selectedAssigneeIds.has(option.value) && '✓'}
                </span>
                <span className="truncate">{option.label}</span>
              </button>
            ))}
            <button
              type="button"
              role="menuitem"
              disabled={task.assignees.length === 0}
              onClick={(event) => {
                event.stopPropagation();
                onAssigneeChange([]);
              }}
              className="w-full rounded px-2 py-1.5 text-left text-xs text-error hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
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
