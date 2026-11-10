import React from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { useOpenTask } from '../hooks/useOpenTask';

export interface TaskDrawerProps {
  spaceId: string;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ spaceId }) => {
  const { taskId, close } = useOpenTask();
  const isOpen = Boolean(taskId);

  return (
    <Drawer isOpen={isOpen} onClose={close} title="Task Details" size="lg">
      <div data-testid="task-drawer-content" className="space-y-4 p-4">
        <p className="text-sm text-text-muted">Task ID: {taskId}</p>
        <p className="text-xs text-text-muted">Space: {spaceId}</p>
      </div>
    </Drawer>
  );
};
