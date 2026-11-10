import React, { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useOpenTask, useSpaceTasks, useTaskFilters } from '../index';
import { isOverdue } from '../utils/taskUtils';
import { sortTasks } from '../utils/taskUtils';
import { CalendarDay } from './CalendarDay';

export interface CalendarViewProps {
  spaceId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ spaceId }) => {
  const tasks = useSpaceTasks(spaceId);
  const { filters } = useTaskFilters();
  const taskData = useMemo(() => {
    let result = (tasks.data ?? []).filter((task) => task.lifecycleStatus !== 'DELETED');
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query),
      );
    }
    if (filters.status?.length)
      result = result.filter((task) => filters.status?.includes(task.progressStatus));
    if (filters.priority?.length)
      result = result.filter((task) => filters.priority?.includes(task.priority));
    return sortTasks(result, filters.sort ?? 'deadline', filters.dir);
  }, [filters, tasks.data]);
  const { open } = useOpenTask();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(month)),
        end: endOfWeek(endOfMonth(month)),
      }),
    [month],
  );
  const tasksByDay = useMemo(() => {
    const map = new Map<string, typeof taskData>();
    for (const task of taskData) {
      const key = format(new Date(task.deadline), 'yyyy-MM-dd');
      const current = map.get(key);
      if (current) current.push(task);
      else map.set(key, [task]);
    }
    return map;
  }, [taskData]);

  if (tasks.isLoading)
    return (
      <div data-testid="calendar-view">
        <Skeleton className="h-[520px]" />
      </div>
    );
  if (tasks.isError)
    return (
      <div data-testid="calendar-view">
        <ErrorState
          message="We could not load this calendar."
          onRetry={() => void tasks.refetch()}
        />
      </div>
    );
  if (taskData.length === 0)
    return (
      <div data-testid="calendar-view">
        <EmptyState
          title="No tasks to schedule"
          description="Create a task with a deadline to see it on the calendar."
        />
      </div>
    );

  return (
    <section
      data-testid="calendar-view"
      aria-label="Calendar view"
      className="rounded-card border border-border bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <h2 className="font-heading text-lg font-semibold text-text">
          {format(month, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            aria-label="Previous month"
            onClick={() => setMonth((value) => subMonths(value, 1))}
          >
            Previous
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMonth(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button
            size="sm"
            variant="outline"
            aria-label="Next month"
            onClick={() => setMonth((value) => addMonths(value, 1))}
          >
            Next
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-border text-center text-xs font-semibold text-text-muted">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayTasks = tasksByDay.get(format(day, 'yyyy-MM-dd')) ?? [];
          return (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              tasks={dayTasks}
              isCurrentMonth={isSameMonth(day, month)}
              isToday={isToday(day)}
              onTaskClick={(task) => open(task._id)}
            />
          );
        })}
      </div>
      <div className="space-y-2 border-t border-border p-4 md:hidden">
        <h3 className="text-sm font-semibold text-text">Agenda</h3>
        {taskData
          .filter((task) => isOverdue(task) || new Date(task.deadline) >= new Date())
          .slice(0, 10)
          .map((task) => (
            <button
              key={task._id}
              type="button"
              onClick={() => open(task._id)}
              className="flex w-full justify-between rounded-input bg-surface-hover p-3 text-left text-sm"
            >
              <span className="truncate text-text">{task.title}</span>
              <span className="ml-3 shrink-0 text-xs text-text-muted">
                {format(new Date(task.deadline), 'MMM d')}
              </span>
            </button>
          ))}
      </div>
    </section>
  );
};
