import React, { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { NotchCard } from '@/components/ui/NotchCard';
import { SubtasksModal, useSubtasks, useUpdateSubtask } from '@/features/subtasks';
import { useMemberLookup } from '../hooks/useMemberLookup';
import { useOpenTask } from '../hooks/useOpenTask';
import { formatDeadline, isOverdue, priorityMeta } from '../utils/taskUtils';
import type { Task } from '../types/task.types';

export interface TaskCardProps {
  task: Task;
  spaceId?: string;
  onClick?: () => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  spaceId = task.spaceId,
  onClick,
  className,
}) => {
  const { getName } = useMemberLookup(spaceId);
  const { open } = useOpenTask();
  const [subtasksModalOpen, setSubtasksModalOpen] = useState(false);
  const subtasksQuery = useSubtasks(task._id);
  const updateSubtask = useUpdateSubtask();

  const subtasks = subtasksQuery.data ?? [];
  const visibleSubtasks = subtasks.slice(0, 2);
  const remainingSubtasksCount = subtasks.length - 2;

  const overdue = isOverdue(task);
  const priority = priorityMeta[task.priority];
  const visibleAssignees = task.assignees.slice(0, 3);
  const overflow = task.assignees.length - visibleAssignees.length;

  const handleOpen = () => {
    open(task._id);
    onClick?.();
  };

  const handleToggleSubtask = (subtaskId: string, currentStatus: string) => {
    updateSubtask.mutate({
      id: subtaskId,
      taskId: task._id,
      data: { status: currentStatus === 'DONE' ? 'TODO' : 'DONE' },
    });
  };

  const subtasksContent = (
    <div className="space-y-1.5">
      {visibleSubtasks.length > 0 && (
        <div className="space-y-1">
          {visibleSubtasks.map((st) => {
            const isDone = st.status === 'DONE';
            return (
              <div
                key={st._id}
                className="hover:bg-surface-hover/60 flex items-center gap-2 rounded px-1 py-0.5 text-xs transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  aria-label={`Mark subtask ${st.title} as ${isDone ? 'incomplete' : 'done'}`}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleToggleSubtask(st._id, st.status)}
                  className="h-3.5 w-3.5 rounded border-border text-accent focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSubtask(st._id, st.status);
                  }}
                  className={`truncate text-left text-xs ${
                    isDone ? 'text-text-muted line-through' : 'text-text'
                  }`}
                >
                  {st.title}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
        {remainingSubtasksCount > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSubtasksModalOpen(true);
            }}
            className="font-medium text-accent hover:underline"
          >
            See all (+{remainingSubtasksCount} more)
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          aria-label={`Add subtask to ${task.title}`}
          onClick={(e) => {
            e.stopPropagation();
            setSubtasksModalOpen(true);
          }}
          className="inline-flex items-center gap-1 font-medium text-text-muted hover:text-accent"
        >
          <span className="text-xs font-bold">+</span> Subtask
        </button>
      </div>
    </div>
  );

  return (
    <>
      <NotchCard
        variant="task"
        title={task.title}
        subtitle={task.description}
        deadline={formatDeadline(task.deadline)}
        isOverdue={overdue}
        onClick={handleOpen}
        onArrowClick={handleOpen}
        subtasksContent={subtasksContent}
        className={className}
        tags={
          task.tags && task.tags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1" aria-label="Task tags">
              {task.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : undefined
        }
        statusBadge={
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={priority.badgeVariant} size="sm">
              {priority.label}
            </Badge>
            {overdue && (
              <Badge variant="error" size="sm">
                Overdue
              </Badge>
            )}
            {task.priority === 'URGENT' && !overdue && (
              <Badge variant="warning" size="sm">
                Urgent
              </Badge>
            )}
          </div>
        }
        actions={
          <div className="flex items-center -space-x-2" aria-label="Assignees">
            {visibleAssignees.map((assignee) => (
              <span
                key={assignee.userId}
                title={getName(assignee.userId)}
                className="rounded-full ring-2 ring-surface"
              >
                <Avatar name={getName(assignee.userId)} size="xs" />
              </span>
            ))}
            {overflow > 0 && (
              <span
                title={task.assignees
                  .slice(3)
                  .map((assignee) => getName(assignee.userId))
                  .join(', ')}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-hover text-[10px] font-semibold text-text-muted ring-2 ring-surface"
              >
                +{overflow}
              </span>
            )}
            {task.assignees.length === 0 && (
              <span className="text-[11px] text-text-muted">Unassigned</span>
            )}
          </div>
        }
      />
      {subtasksModalOpen && (
        <SubtasksModal
          isOpen={subtasksModalOpen}
          onClose={() => setSubtasksModalOpen(false)}
          taskId={task._id}
          spaceId={spaceId}
          taskTitle={task.title}
        />
      )}
    </>
  );
};
