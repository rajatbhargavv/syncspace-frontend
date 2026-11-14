import React, { useContext, useMemo, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { CreateTaskDialog } from './CreateTaskDialog';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';
import { useSpace } from '@/features/spaces';
import { AuthContext } from '@/app/providers/AuthContext';
import { filterTasks, groupTasksByStatus, statusMeta } from '../utils/taskUtils';
import { useSpaceTasks } from '../hooks/useSpaceTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import type { Task, TaskProgressStatus } from '../types/task.types';

export interface BoardViewProps {
  spaceId: string;
}

const STATUSES: TaskProgressStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

export const BoardView: React.FC<BoardViewProps> = ({ spaceId }) => {
  const spaceQuery = useSpace(spaceId);
  const tasksQuery = useSpaceTasks(spaceId);
  const { filters } = useTaskFilters();
  const updateStatus = useUpdateTaskStatus();
  const auth = useContext(AuthContext);
  const currentUserId = auth?.user?._id;
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskProgressStatus | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Record<TaskProgressStatus, boolean>>({
    TODO: false,
    IN_PROGRESS: false,
    COMPLETED: false,
  });

  const toggleColumn = (status: TaskProgressStatus) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const filteredTasks = useMemo(() => {
    return filterTasks(tasksQuery.data ?? [], filters, currentUserId);
  }, [filters, tasksQuery.data, currentUserId]);
  const groups = useMemo(() => groupTasksByStatus(filteredTasks), [filteredTasks]);
  const kind = spaceQuery.data?.kind;

  if (tasksQuery.isLoading || spaceQuery.isLoading) {
    return (
      <div data-testid="board-view" className="grid gap-4 md:grid-cols-3">
        {STATUSES.map((status) => (
          <Skeleton key={status} className="h-96 w-full" />
        ))}
      </div>
    );
  }
  if (tasksQuery.isError || spaceQuery.isError || !spaceQuery.data || !kind) {
    return (
      <ErrorState
        message="We could not load this board."
        onRetry={() => {
          void tasksQuery.refetch();
          void spaceQuery.refetch();
        }}
      />
    );
  }
  const space = spaceQuery.data;
  const meta = statusMeta(kind);
  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = filteredTasks.find((item) => item._id === active.id);
    setActiveTask(task ?? null);
  };
  const handleDragEnd = ({ active: _active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (
      !over ||
      !activeTask ||
      over.id === activeTask.progressStatus ||
      space.status === 'Inactive'
    )
      return;
    const nextStatus = STATUSES.find((status) => status === over.id);
    if (!nextStatus) return;
    updateStatus.mutate({ taskId: activeTask._id, spaceId, progressStatus: nextStatus });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements: {
            onDragStart: ({ active: _active }) => `Picked up a task.`,
            onDragOver: ({ over }) =>
              over ? `Task moved over ${String(over.id)}.` : 'Task left a column.',
            onDragEnd: ({ active, over }) =>
              over
                ? `Dropped task ${String(active.id)} in ${String(over.id)}.`
                : `Cancelled moving task ${String(active.id)}.`,
            onDragCancel: ({ active }) => `Cancelled moving task ${String(active.id)}.`,
          },
        }}
      >
        <div
          data-testid="board-view"
          className="flex snap-x items-start gap-4 overflow-x-auto pb-3 md:overflow-visible"
        >
          {STATUSES.map((status) => (
            <div
              key={status}
              className={
                collapsedColumns[status]
                  ? 'shrink-0'
                  : 'min-w-[min(84vw,20rem)] flex-1 transition-all'
              }
            >
              <BoardColumn
                spaceId={spaceId}
                status={status}
                label={meta[status].label}
                tasks={groups[status]}
                onCreate={setCreateStatus}
                isInactive={space.status === 'Inactive'}
                activeTaskId={activeTask?._id}
                isCollapsed={collapsedColumns[status]}
                onToggleCollapse={() => toggleColumn(status)}
                totalTasksCount={filteredTasks.length}
              />
            </div>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCard task={activeTask} spaceId={spaceId} /> : null}
        </DragOverlay>
      </DndContext>
      <CreateTaskDialog
        spaceId={spaceId}
        open={createStatus !== null}
        onOpenChange={(open) => {
          if (!open) setCreateStatus(null);
        }}
        defaultStatus={createStatus ?? 'TODO'}
      />
    </>
  );
};
