import React, { useMemo, useState } from 'react';
import { SpaceThemeDot, type Space } from '@/features/spaces';
import { toLocalDateString } from '@/features/tasks/hooks/useCrossSpaceTasks';
import type { Task } from '@/features/tasks/types/task.types';

export interface ActivityHeatmapCalendarProps {
  spaces: Space[];
  activityData: {
    overallCompletedMap: Map<string, Task[]>;
    overallAssignedMap: Map<string, number>;
    bySpaceMap: Map<string, Map<string, Task[]>>;
    currentStreak: number;
    longestStreak: number;
    totalCompleted: number;
  };
  isLoading?: boolean;
}

type CalendarViewMode = 'continuous' | 'month' | 'compare';

export const ActivityHeatmapCalendar: React.FC<ActivityHeatmapCalendarProps> = ({
  spaces,
  activityData,
  isLoading = false,
}) => {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<CalendarViewMode>('continuous');
  const [selectedDate, setSelectedDate] = useState<string>(() => toLocalDateString(new Date()));

  // Active Map of completed tasks according to selected space
  const completedMap = useMemo(() => {
    if (selectedSpaceId === 'ALL') {
      return activityData.overallCompletedMap;
    }
    return activityData.bySpaceMap.get(selectedSpaceId) ?? new Map<string, Task[]>();
  }, [selectedSpaceId, activityData]);

  // Compute activity level for a given date
  // Rule: Lighter green dot = less work than assigned for that day; Darker dot = more work done
  const getDayMetrics = (dateStr: string) => {
    const completedTasks = completedMap.get(dateStr) ?? [];
    const completedCount = completedTasks.length;
    const assignedCount = activityData.overallAssignedMap.get(dateStr) ?? 0;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    let label = 'No activity';

    if (completedCount === 0) {
      level = 0;
      label = assignedCount > 0 ? `0/${assignedCount} tasks completed` : 'No tasks completed';
    } else if (assignedCount > 0) {
      if (completedCount < assignedCount) {
        level = 1; // Lighter green = less work done than assigned!
        label = `${completedCount}/${assignedCount} tasks (under target)`;
      } else if (completedCount === assignedCount) {
        level = 2; // Met target
        label = `${completedCount}/${assignedCount} tasks (target met)`;
      } else if (completedCount > assignedCount && completedCount < assignedCount + 3) {
        level = 3; // Exceeded target
        label = `${completedCount}/${assignedCount} tasks (exceeded target!)`;
      } else {
        level = 4; // Darker green = much more work done!
        label = `${completedCount}/${assignedCount} tasks (high output!)`;
      }
    } else {
      // No specific assignment target for that day
      if (completedCount === 1) level = 1;
      else if (completedCount === 2) level = 2;
      else if (completedCount <= 4) level = 3;
      else level = 4;
      label = `${completedCount} task${completedCount === 1 ? '' : 's'} completed`;
    }

    return { completedCount, assignedCount, completedTasks, level, label };
  };

  const getLevelColorClass = (level: 0 | 1 | 2 | 3 | 4, isSelected: boolean) => {
    const ring = isSelected ? 'ring-2 ring-accent scale-110 z-10' : '';
    switch (level) {
      case 0:
        return `bg-surface-hover/70 border border-border/50 hover:border-text-muted ${ring}`;
      case 1:
        return `bg-emerald-300 dark:bg-emerald-900 border border-emerald-400/40 hover:brightness-110 ${ring}`;
      case 2:
        return `bg-emerald-400 dark:bg-emerald-700 border border-emerald-500/50 hover:brightness-110 ${ring}`;
      case 3:
        return `bg-emerald-500 dark:bg-emerald-500 border border-emerald-400 hover:brightness-110 ${ring}`;
      case 4:
        return `bg-emerald-700 dark:bg-emerald-300 border border-emerald-300 dark:border-emerald-100 hover:brightness-110 ${ring}`;
    }
  };

  // 1. Continuous 24-week grid (GitHub style)
  const continuousWeeks = useMemo(() => {
    const weeks: Array<Array<{ date: string; dayOfWeek: number }>> = [];
    const today = new Date();
    // 24 weeks ~ 168 days
    const totalDays = 24 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + (7 - today.getDay()));

    let currentDay = new Date(startDate);
    let currentWeek: Array<{ date: string; dayOfWeek: number }> = [];

    for (let i = 0; i < totalDays; i++) {
      const dStr = toLocalDateString(currentDay);
      currentWeek.push({ date: dStr, dayOfWeek: currentDay.getDay() });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentDay.setDate(currentDay.getDate() + 1);
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);
    return weeks;
  }, []);

  // 2. Month-by-month state (LeetCode style)
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const currentMonthDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const monthGridDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: Array<{ date: string; dayNumber: number; isCurrentMonth: boolean }> = [];

    // Prefix padding for previous month days
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: toLocalDateString(prevDate),
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const curDate = new Date(year, month, d);
      days.push({
        date: toLocalDateString(curDate),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Suffix padding
    while (days.length % 7 !== 0) {
      const nextDayNum = days.length - (startingDayOfWeek + lastDay.getDate()) + 1;
      const nextDate = new Date(year, month + 1, nextDayNum);
      days.push({
        date: toLocalDateString(nextDate),
        dayNumber: nextDate.getDate(),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonthDate]);

  const monthTitle = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedDayMetrics = getDayMetrics(selectedDate);
  const selectedDayFormatted = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (isLoading) {
    return (
      <section
        aria-labelledby="activity-heatmap-heading"
        className="rounded-card border border-border bg-surface p-5 shadow-card space-y-4"
      >
        <div className="h-6 w-48 rounded bg-surface-hover animate-pulse" />
        <div className="h-40 rounded-xl bg-surface-hover/60 animate-pulse" />
      </section>
    );
  }

  return (
    <section
      aria-labelledby="activity-heatmap-heading"
      className="rounded-card border border-border bg-surface p-5 shadow-card space-y-5"
    >
      {/* Top Banner: Streaks & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 id="activity-heatmap-heading" className="font-heading text-lg font-bold text-text">
              Productivity Heatmap & Activity Calendar
            </h2>
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Track daily completed work like LeetCode & GitHub. Lighter green = less work than assigned; darker green = more work done.
          </p>
        </div>

        {/* Streak Counters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 shadow-sm">
            <span className="text-base">🔥</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-amber-500">Current Streak</p>
              <p className="text-sm font-bold text-text">{activityData.currentStreak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-1.5 shadow-sm">
            <span className="text-base">🏆</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-accent">Longest Streak</p>
              <p className="text-sm font-bold text-text">{activityData.longestStreak} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 shadow-sm">
            <span className="text-base">✅</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-500">Total Completed</p>
              <p className="text-sm font-bold text-text">{activityData.totalCompleted} Tasks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Multiple Calendars (Space Selector + View Selector) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-hover/40 p-2.5 rounded-xl border border-border/50">
        {/* Calendar Switcher: Overall vs Specific Spaces */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-muted">Calendar:</span>
          <select
            value={selectedSpaceId}
            onChange={(e) => setSelectedSpaceId(e.target.value)}
            className="rounded-input border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text focus:border-accent focus:outline-none"
          >
            <option value="ALL">🌐 Overall (All Spaces Combined)</option>
            {spaces.map((s) => (
              <option key={s._id} value={s._id}>
                {s.kind === 'MY_CORNER' || s.spaceType === 'Personal' ? '🏠' : '🚀'} {s.name} (
                {s.spaceType ?? (s.kind === 'MY_CORNER' ? 'Personal' : 'Shared')})
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center rounded-button border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setViewMode('continuous')}
            className={`rounded-button px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === 'continuous'
                ? 'bg-accent text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Continuous (24 Wks)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`rounded-button px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === 'month'
                ? 'bg-accent text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Month Matrix
          </button>
          <button
            type="button"
            onClick={() => setViewMode('compare')}
            className={`rounded-button px-2.5 py-1 text-xs font-semibold transition-colors ${
              viewMode === 'compare'
                ? 'bg-accent text-text-inverse shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Compare Spaces
          </button>
        </div>
      </div>

      {/* VIEW 1: Continuous 24-Week Heatmap (GitHub Style) */}
      {viewMode === 'continuous' && (
        <div className="space-y-3">
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[680px]">
              <div className="flex gap-1.5 justify-between">
                {continuousWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map(({ date }) => {
                      const metrics = getDayMetrics(date);
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => setSelectedDate(date)}
                          aria-label={`${date}: ${metrics.label}`}
                          title={`${date}: ${metrics.label}`}
                          className={`h-3.5 w-3.5 rounded-sm transition-transform duration-150 ${getLevelColorClass(
                            metrics.level,
                            isSelected,
                          )}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border/40">
            <span>Click any day to view completed tasks and output breakdown</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="h-3 w-3 rounded-sm bg-surface-hover/70 border border-border/50" />
              <span className="h-3 w-3 rounded-sm bg-emerald-300 dark:bg-emerald-900 border border-emerald-400/40" />
              <span className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-700 border border-emerald-500/50" />
              <span className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-500 border border-emerald-400" />
              <span className="h-3 w-3 rounded-sm bg-emerald-700 dark:bg-emerald-300 border border-emerald-300" />
              <span>More</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Month Matrix (LeetCode Calendar Style) */}
      {viewMode === 'month' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-text">{monthTitle}</h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev - 1)}
                className="h-7 w-7 rounded-button border border-border flex items-center justify-center text-xs font-bold hover:bg-surface-hover"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset(0)}
                className="rounded-button border border-border px-2 py-1 text-xs hover:bg-surface-hover"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev + 1)}
                className="h-7 w-7 rounded-button border border-border flex items-center justify-center text-xs font-bold hover:bg-surface-hover"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="font-bold text-text-muted py-1">
                {d}
              </div>
            ))}

            {monthGridDays.map(({ date, dayNumber, isCurrentMonth }) => {
              const metrics = getDayMetrics(date);
              const isSelected = selectedDate === date;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex h-12 flex-col items-center justify-between rounded-lg p-1.5 transition-all text-xs ${
                    isCurrentMonth ? '' : 'opacity-30'
                  } ${getLevelColorClass(metrics.level, isSelected)}`}
                  title={`${date}: ${metrics.label}`}
                >
                  <span className="font-semibold text-[11px] leading-none">{dayNumber}</span>
                  {metrics.completedCount > 0 && (
                    <span className="text-[10px] font-bold leading-none">
                      +{metrics.completedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: Compare Spaces (Multi-Calendar Grid) */}
      {viewMode === 'compare' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((s) => {
            const spaceCompleted = activityData.bySpaceMap.get(s._id);
            let count = 0;
            if (spaceCompleted) {
              for (const tasks of spaceCompleted.values()) count += tasks.length;
            }
            return (
              <div
                key={s._id}
                onClick={() => {
                  setSelectedSpaceId(s._id);
                  setViewMode('continuous');
                }}
                className="cursor-pointer rounded-card border border-border bg-surface p-4 transition-all hover:border-accent hover:shadow-card"
              >
                <div className="flex items-center gap-2">
                  <SpaceThemeDot theme={s.theme} size="md" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-text truncate">{s.name}</h4>
                    <p className="text-[11px] text-text-muted">
                      {s.spaceType ?? (s.kind === 'MY_CORNER' ? 'Personal' : 'Shared')} Space
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                  <span className="text-text-muted">Total tasks completed:</span>
                  <span className="font-bold text-accent">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day Inspector: Details of selected date */}
      <div className="rounded-xl border border-border/70 bg-surface-hover/30 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-text">📅 {selectedDayFormatted}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                selectedDayMetrics.level === 0
                  ? 'bg-surface-hover text-text-muted'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {selectedDayMetrics.label}
            </span>
          </div>

          <div className="text-xs text-text-muted">
            <span className="font-semibold text-text">{selectedDayMetrics.completedCount}</span> completed •{' '}
            <span className="font-semibold text-text">{selectedDayMetrics.assignedCount}</span> assigned for this day
          </div>
        </div>

        {selectedDayMetrics.completedTasks.length === 0 ? (
          <p className="pt-3 text-xs text-text-muted italic">
            No tasks completed on this date.
          </p>
        ) : (
          <div className="mt-3 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Tasks finished on this date:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDayMetrics.completedTasks.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-text"
                >
                  <span className="text-success font-bold">✓</span>
                  <span className="font-medium">{t.title}</span>
                  {t.tags && t.tags.length > 0 && (
                    <span className="text-[10px] text-accent">#{t.tags[0]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
