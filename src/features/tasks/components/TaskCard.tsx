import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { NotchCard } from '@/components/ui/NotchCard';
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
  const overdue = isOverdue(task);
  const priority = priorityMeta[task.priority];
  const visibleAssignees = task.assignees.slice(0, 3);
  const overflow = task.assignees.length - visibleAssignees.length;
  const handleOpen = () => {
    open(task._id);
    onClick?.();
  };

  return (
    <NotchCard
      variant="task"
      title={task.title}
      subtitle={task.description}
      deadline={formatDeadline(task.deadline)}
      isOverdue={overdue}
      onClick={handleOpen}
      onArrowClick={handleOpen}
      className={className}
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
  );
};
