import React, { useContext, useEffect, useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { ApiError } from '@/lib/http/ApiError';
import { AuthContext } from '@/app/providers/AuthContext';
import { useSpace } from '@/features/spaces';
import { useSpaceMembers } from '@/features/members';
import { SubtaskList } from '@/features/subtasks';
import { useOpenTask } from '../hooks/useOpenTask';
import { useTask } from '../hooks/useTask';
import { TaskHeaderEditor } from './TaskHeaderEditor';
import { TaskMetaPanel } from './TaskMetaPanel';
import { AssigneePicker } from './AssigneePicker';
import { DeleteTaskDialog } from './DeleteTaskDialog';
import { TaskDiscussionSlot } from './TaskDiscussionSlot';

export interface TaskDrawerProps {
  spaceId: string;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ spaceId }) => {
  const { taskId, close } = useOpenTask();
  const isOpen = Boolean(taskId);
  const taskQuery = useTask(taskId ?? '');
  const space = useSpace(spaceId);
  const members = useSpaceMembers(spaceId);
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const task = taskQuery.data;
  const isInactive = space.data?.status === 'Inactive';
  const isOwner =
    members.data?.some((member) => member.role === 'OWNER' && member.userId._id === user?._id) ??
    false;
  const canDelete = Boolean(task && (task.createdBy === user?._id || isOwner));

  useEffect(() => {
    if (taskQuery.error instanceof ApiError && taskQuery.error.isNotFound) close();
  }, [close, taskQuery.error]);

  return (
    <Drawer isOpen={isOpen} onClose={close} title={task?.title ?? 'Task Details'} size="lg">
      <div data-testid="task-drawer-content" className="space-y-6 p-1 mr-5">
        {taskQuery.isLoading ? <Skeleton className="h-28" /> : null}
        {taskQuery.isError &&
        !(taskQuery.error instanceof ApiError && taskQuery.error.isNotFound) ? (
          <ErrorState
            message="Unable to load this task."
            onRetry={() => void taskQuery.refetch()}
          />
        ) : null}
        {!taskQuery.isLoading && !taskQuery.isError && !task ? (
          <EmptyState
            title="Task not found or deleted"
            description="This task is no longer available."
          />
        ) : null}
        {task && space.data ? (
          <>
            <TaskHeaderEditor task={task} readOnly={isInactive} />
            <TaskMetaPanel task={task} spaceKind={space.data.kind} readOnly={isInactive} />
            <AssigneePicker task={task} readOnly={isInactive} />
            <SubtaskList taskId={task._id} spaceId={spaceId} readOnly={isInactive} />
            <TaskDiscussionSlot taskId={task._id} spaceId={spaceId} />
            {canDelete && !isInactive && (
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete task
              </Button>
            )}
            <DeleteTaskDialog
              task={task}
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              onDeleted={close}
            />
          </>
        ) : null}
      </div>
    </Drawer>
  );
};
