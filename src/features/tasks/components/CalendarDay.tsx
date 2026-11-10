import React from 'react';
import { cn } from '@/lib/cn';
import { priorityMeta } from '../utils/taskUtils';
import type { Task } from '../types/task.types';

export interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onTaskClick: (task: Task) => void;
}

export const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  tasks,
  isCurrentMonth,
  isToday: today,
  onTaskClick,
}) => (
  <div
    className={cn(
      'border-border/60 min-h-28 border-b border-r p-2',
      !isCurrentMonth && 'bg-surface-hover/30',
    )}
  >
    <div
      className={cn(
        'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs',
        today && 'bg-accent font-bold text-text-inverse',
        !isCurrentMonth && 'text-text-muted',
      )}
    >
      {date.getDate()}
    </div>
    <div className="space-y-1">
      {tasks.slice(0, 3).map((task) => (
        <button
          key={task._id}
          type="button"
          onClick={() => onTaskClick(task)}
          className={cn(
            'block w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-medium',
            priorityMeta[task.priority].color,
            'hover:bg-accent/15 bg-surface-hover',
          )}
        >
          {task.title}
        </button>
      ))}
      {tasks.length > 3 && (
        <span className="block px-1 text-[11px] text-text-muted">+{tasks.length - 3} more</span>
      )}
    </div>
  </div>
);
