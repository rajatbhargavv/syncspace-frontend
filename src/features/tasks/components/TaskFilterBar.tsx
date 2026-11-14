import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { useSpace } from '@/features/spaces';
import { useMemberLookup } from '../hooks/useMemberLookup';
import { useSpaceTasks } from '../hooks/useSpaceTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { FilterChip } from './FilterChip';
import type { TaskPriority, TaskProgressStatus } from '../types/task.types';

export interface TaskFilterBarProps {
  spaceId: string;
  action?: React.ReactNode;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({ spaceId, action }) => {
  const space = useSpace(spaceId);
  const spaceTasks = useSpaceTasks(spaceId);
  const { members } = useMemberLookup(spaceId);
  const { filters, setFilters, resetFilters } = useTaskFilters();
  const [query, setQuery] = useState(filters.search ?? '');
  const debouncedQuery = useDebounce(query, 250);
  const [expanded, setExpanded] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const t of spaceTasks.data ?? []) {
      if (t.tags) {
        for (const tag of t.tags) {
          const trimmed = tag.trim();
          if (trimmed) set.add(trimmed);
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [spaceTasks.data]);

  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expanded]);

  useEffect(() => {
    setFilters({ search: debouncedQuery || undefined });
  }, [debouncedQuery, setFilters]);

  const statusOptions = [
    { value: 'TODO', label: space.data?.kind === 'BUILDERS_CIRCLE' ? 'Backlog' : 'To do' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'COMPLETED', label: 'Done' },
  ];

  const isMultipleAssignees = (filters.assigneeIds?.length ?? 0) > 1;

  const activeCount =
    (filters.status?.length ?? 0) +
    (filters.priority?.length ?? 0) +
    (filters.tags?.length ?? 0) +
    (filters.assigneeIds?.length ? filters.assigneeIds.length : filters.assigneeId ? 1 : 0) +
    (filters.search ? 1 : 0);

  const toggle = (key: 'status' | 'priority', value: TaskPriority | TaskProgressStatus) => {
    const current = (filters[key] ?? []) as Array<TaskPriority | TaskProgressStatus>;
    setFilters({
      [key]: current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    });
  };

  const toggleTag = (tag: string) => {
    const current = filters.tags ?? [];
    setFilters({
      tags: current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    });
  };

  return (
    <div
      ref={filterBarRef}
      data-testid="task-filter-bar"
      aria-label="Task filters"
      className="relative w-full"
    >
      <div className="flex flex-wrap items-center justify-start gap-2.5 sm:justify-end">
        <div className="relative w-44 sm:w-56">
          <Input
            aria-label="Search tasks"
            placeholder="Search tasks..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="py-1.5 pl-8 text-xs"
            startIcon={
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
        </div>

        <Button
          size="sm"
          variant={expanded ? 'primary' : 'outline'}
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="shrink-0 gap-1.5"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-accent/20 py-0.2 rounded-full px-1.5 text-[10px] font-bold text-accent">
              {activeCount}
            </span>
          )}
        </Button>

        {activeCount > 0 && (
          <Button size="sm" variant="ghost" onClick={resetFilters} className="shrink-0 text-xs">
            Clear
          </Button>
        )}

        {action}
      </div>

      {expanded && (
        <div className="animate-in fade-in zoom-in-95 absolute right-0 top-full z-dropdown mt-2 w-full duration-150 sm:w-[560px] md:w-[680px]">
          <div className="grid gap-3.5 rounded-card border border-border bg-surface p-4 shadow-elevated sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-text">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map((option) => (
                  <FilterChip
                    key={option.value}
                    label={option.label}
                    active={filters.status?.includes(option.value as TaskProgressStatus)}
                    onClick={() => toggle('status', option.value as TaskProgressStatus)}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-text">Priority</p>
              <div className="flex flex-wrap gap-1.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((priority) => (
                  <FilterChip
                    key={priority}
                    label={priority.toLowerCase()}
                    active={filters.priority?.includes(priority)}
                    onClick={() => toggle('priority', priority)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Select
                aria-label="Assignee"
                label="Assignee"
                value={
                  isMultipleAssignees
                    ? '__multiple__'
                    : (filters.assigneeIds?.[0] ?? filters.assigneeId ?? '')
                }
                options={[
                  { value: '', label: 'Everyone' },
                  ...(isMultipleAssignees
                    ? [
                        {
                          value: '__multiple__',
                          label: `${filters.assigneeIds?.length} members selected`,
                        },
                      ]
                    : []),
                  { value: 'me', label: 'Me' },
                  { value: 'unassigned', label: 'Unassigned' },
                  ...members.map((member) => ({ value: member._id, label: member.name })),
                ]}
                onChange={(event) => {
                  const val = event.target.value;
                  if (!val || val === '__multiple__') {
                    setFilters({ assigneeId: undefined, assigneeIds: undefined });
                  } else {
                    setFilters({
                      assigneeId: val,
                      assigneeIds: [val],
                    });
                  }
                }}
              />
              {isMultipleAssignees && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {filters.assigneeIds?.map((id) => {
                    const memberName =
                      id === 'me'
                        ? 'Me'
                        : id === 'unassigned'
                          ? 'Unassigned'
                          : (members.find((m) => m._id === id)?.name ?? id);
                    return (
                      <span
                        key={id}
                        className="bg-accent/15 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-accent"
                      >
                        {memberName}
                        <button
                          type="button"
                          aria-label={`Remove ${memberName} filter`}
                          className="hover:text-text"
                          onClick={() => {
                            const remaining = filters.assigneeIds?.filter((x) => x !== id) ?? [];
                            setFilters({
                              assigneeIds: remaining.length > 0 ? remaining : undefined,
                              assigneeId: remaining.length > 0 ? remaining[0] : undefined,
                            });
                          }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select
                aria-label="Sort tasks"
                label="Sort"
                value={filters.sort ?? 'deadline'}
                options={[
                  { value: 'deadline', label: 'Deadline' },
                  { value: 'priority', label: 'Priority' },
                  { value: 'createdAt', label: 'Created' },
                ]}
                onChange={(event) =>
                  setFilters({ sort: event.target.value as 'deadline' | 'priority' | 'createdAt' })
                }
              />
              <Button
                className="self-end"
                size="sm"
                variant="outline"
                onClick={() => setFilters({ dir: filters.dir === 'asc' ? 'desc' : 'asc' })}
              >
                {filters.dir === 'desc' ? 'Desc' : 'Asc'}
              </Button>
            </div>

            {availableTags.length > 0 && (
              <div className="border-t border-border/60 pt-3 sm:col-span-2 lg:col-span-4">
                <p className="mb-2 text-xs font-semibold text-text">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => (
                    <FilterChip
                      key={tag}
                      label={tag}
                      active={filters.tags?.includes(tag)}
                      onClick={() => toggleTag(tag)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
