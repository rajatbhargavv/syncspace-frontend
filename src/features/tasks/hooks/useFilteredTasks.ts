import { useContext, useMemo } from 'react';
import { AuthContext } from '@/app/providers/AuthContext';
import { useSpaceTasks } from './useSpaceTasks';
import { useTaskFilters } from './useTaskFilters';
import { filterTasks } from '../utils/taskUtils';

export function useFilteredTasks(spaceId: string) {
  const tasksQuery = useSpaceTasks(spaceId);
  const { filters, setFilters, resetFilters } = useTaskFilters();
  const auth = useContext(AuthContext);
  const currentUserId = auth?.user?._id;

  const filteredTasks = useMemo(() => {
    return filterTasks(tasksQuery.data ?? [], filters, currentUserId);
  }, [tasksQuery.data, filters, currentUserId]);

  return {
    ...tasksQuery,
    data: filteredTasks,
    rawTasks: tasksQuery.data ?? [],
    filters,
    setFilters,
    resetFilters,
  };
}
