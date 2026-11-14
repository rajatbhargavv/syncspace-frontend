import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { isOverdue, priorityMeta } from '../utils/taskUtils';
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (tasks.length > 0 && !isHovered) {
      showTimerRef.current = window.setTimeout(() => {
        setIsHovered(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (showTimerRef.current) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (isHovered) {
      hideTimerRef.current = window.setTimeout(() => {
        setIsHovered(false);
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const isAlignRight = date.getDay() >= 4;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'border-border/60 relative min-h-28 border-b border-r p-2 transition-colors',
        !isCurrentMonth && 'bg-surface-hover/30',
        isHovered && tasks.length > 0 && 'bg-surface-hover/20',
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
              'block w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-medium transition-colors',
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

      {/* Hover popover with 150ms delay showing all tasks scheduled for this day */}
      {isHovered && tasks.length > 0 && (
        <div
          role="tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'animate-in fade-in zoom-in-95 absolute top-full z-dropdown mt-1 w-64 rounded-card border border-border bg-surface p-3 shadow-elevated duration-150 md:w-72',
            isAlignRight ? 'right-0' : 'left-0',
          )}
        >
          <div className="border-border/70 mb-2.5 flex items-center justify-between border-b pb-2">
            <span className="text-xs font-semibold text-text">{format(date, 'EEE, MMM d')}</span>
            <span className="text-[11px] font-medium text-text-muted">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="max-h-60 space-y-1.5 overflow-y-auto pr-0.5">
            {tasks.map((task) => {
              const priority = priorityMeta[task.priority];
              const overdue = isOverdue(task);
              return (
                <button
                  key={task._id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  className="border-border/40 bg-surface-hover/40 hover:border-accent/40 flex w-full items-center justify-between gap-2 rounded-input border p-2 text-left transition-colors hover:bg-surface-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-text">{task.title}</p>
                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border-accent/25 bg-accent/10 py-0.2 inline-flex items-center rounded-full border px-1.5 text-[9px] font-medium text-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {task.description && (
                      <p className="mt-0.5 truncate text-[10px] text-text-muted">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant={priority.badgeVariant} size="sm">
                      {priority.label}
                    </Badge>
                    {overdue && (
                      <Badge variant="error" size="sm">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
