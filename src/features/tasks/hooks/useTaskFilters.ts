import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TaskFilters, TaskPriority, TaskProgressStatus } from '../types/task.types';

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: TaskFilters = useMemo(() => {
    const q = searchParams.get('q') ?? undefined;
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const assigneeParam = searchParams.get('assignee') ?? undefined;
    const sort = (searchParams.get('sort') as TaskFilters['sort']) ?? undefined;
    const dir = (searchParams.get('dir') as TaskFilters['dir']) ?? undefined;

    const status = statusParam
      ? (statusParam.split(',').filter(Boolean) as TaskProgressStatus[])
      : undefined;
    const priority = priorityParam
      ? (priorityParam.split(',').filter(Boolean) as TaskPriority[])
      : undefined;
    const assigneeIds = assigneeParam ? assigneeParam.split(',').filter(Boolean) : undefined;

    return {
      search: q || undefined,
      status: status && status.length > 0 ? status : undefined,
      priority: priority && priority.length > 0 ? priority : undefined,
      assigneeId: assigneeIds && assigneeIds.length > 0 ? assigneeIds[0] : undefined,
      assigneeIds: assigneeIds && assigneeIds.length > 0 ? assigneeIds : undefined,
      sort: sort || undefined,
      dir: dir || undefined,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (updater: Partial<TaskFilters> | ((prev: TaskFilters) => TaskFilters)) => {
      setSearchParams(
        (prev) => {
          const statusParam = prev.get('status');
          const priorityParam = prev.get('priority');
          const assigneeParam = prev.get('assignee');
          const prevAssigneeIds = assigneeParam
            ? assigneeParam.split(',').filter(Boolean)
            : undefined;

          const currentFilters: TaskFilters = {
            search: prev.get('q') ?? undefined,
            status: statusParam
              ? (statusParam.split(',').filter(Boolean) as TaskProgressStatus[])
              : undefined,
            priority: priorityParam
              ? (priorityParam.split(',').filter(Boolean) as TaskPriority[])
              : undefined,
            assigneeId:
              prevAssigneeIds && prevAssigneeIds.length > 0 ? prevAssigneeIds[0] : undefined,
            assigneeIds:
              prevAssigneeIds && prevAssigneeIds.length > 0 ? prevAssigneeIds : undefined,
            sort: (prev.get('sort') as TaskFilters['sort']) ?? undefined,
            dir: (prev.get('dir') as TaskFilters['dir']) ?? undefined,
          };

          const next =
            typeof updater === 'function'
              ? updater(currentFilters)
              : { ...currentFilters, ...updater };
          const newParams = new URLSearchParams(prev);

          if (next.search) newParams.set('q', next.search);
          else newParams.delete('q');

          if (next.status && next.status.length > 0) {
            newParams.set('status', next.status.join(','));
          } else {
            newParams.delete('status');
          }

          if (next.priority && next.priority.length > 0) {
            newParams.set('priority', next.priority.join(','));
          } else {
            newParams.delete('priority');
          }

          let effectiveAssignees: string[] | undefined;
          if ('assigneeIds' in next) {
            effectiveAssignees =
              next.assigneeIds && next.assigneeIds.length > 0 ? next.assigneeIds : undefined;
          } else if ('assigneeId' in next) {
            effectiveAssignees = next.assigneeId ? [next.assigneeId] : undefined;
          } else {
            effectiveAssignees = currentFilters.assigneeIds;
          }

          if (effectiveAssignees && effectiveAssignees.length > 0) {
            newParams.set('assignee', effectiveAssignees.join(','));
          } else {
            newParams.delete('assignee');
          }

          if (next.sort) newParams.set('sort', next.sort);
          else newParams.delete('sort');

          if (next.dir) newParams.set('dir', next.dir);
          else newParams.delete('dir');

          return newParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('q');
        newParams.delete('status');
        newParams.delete('priority');
        newParams.delete('assignee');
        newParams.delete('sort');
        newParams.delete('dir');
        return newParams;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { filters, setFilters, resetFilters };
}
