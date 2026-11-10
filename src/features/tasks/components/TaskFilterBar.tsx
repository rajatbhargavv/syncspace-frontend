import React, { useEffect, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import { useSpace } from '@/features/spaces';
import { useMemberLookup, useTaskFilters } from '../index';
import { FilterChip } from './FilterChip';
import type { TaskPriority, TaskProgressStatus } from '../types/task.types';

export interface TaskFilterBarProps {
  spaceId: string;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({ spaceId }) => {
  const space = useSpace(spaceId);
  const { members } = useMemberLookup(spaceId);
  const { filters, setFilters, resetFilters } = useTaskFilters();
  const [query, setQuery] = useState(filters.search ?? '');
  const debouncedQuery = useDebounce(query, 250);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setFilters({ search: debouncedQuery || undefined });
  }, [debouncedQuery, setFilters]);

  const statusOptions = [
    { value: 'TODO', label: space.data?.kind === 'BUILDERS_CIRCLE' ? 'Backlog' : 'To do' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'COMPLETED', label: 'Done' },
  ];
  const activeCount =
    (filters.status?.length ?? 0) +
    (filters.priority?.length ?? 0) +
    (filters.assigneeId ? 1 : 0) +
    (filters.search ? 1 : 0);
  const toggle = (key: 'status' | 'priority', value: TaskPriority | TaskProgressStatus) => {
    const current = (filters[key] ?? []) as Array<TaskPriority | TaskProgressStatus>;
    setFilters({
      [key]: current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    });
  };

  return (
    <div data-testid="task-filter-bar" aria-label="Task filters" className="w-full">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Search tasks"
          placeholder="Search tasks..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-40 py-1.5 text-xs sm:w-44"
        />
        <Button
          size="sm"
          variant="outline"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
        {activeCount > 0 && (
          <Button size="sm" variant="ghost" onClick={resetFilters}>
            Clear
          </Button>
        )}
      </div>
      {expanded && (
        <div className="mt-3 grid gap-3 rounded-card border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <Select
            aria-label="Assignee"
            label="Assignee"
            value={filters.assigneeId ?? ''}
            options={[
              { value: '', label: 'Everyone' },
              { value: 'me', label: 'Me' },
              { value: 'unassigned', label: 'Unassigned' },
              ...members.map((member) => ({ value: member._id, label: member.name })),
            ]}
            onChange={(event) => setFilters({ assigneeId: event.target.value || undefined })}
          />
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
        </div>
      )}
    </div>
  );
};
