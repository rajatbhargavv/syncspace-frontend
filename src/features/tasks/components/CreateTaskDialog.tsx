import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import type { TaskProgressStatus } from '../types/task.types';

export interface CreateTaskDialogProps {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: TaskProgressStatus;
}

export const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  spaceId,
  open,
  onOpenChange,
  defaultStatus = 'TODO',
}) => {
  return (
    <Dialog isOpen={open} onClose={() => onOpenChange(false)} title="Create task" size="md">
      <div data-testid="create-task-dialog-content" className="space-y-4">
        <p className="text-sm text-text-muted">Create task placeholder for space: {spaceId}</p>
        <p className="text-xs text-text-muted">Default Status: {defaultStatus}</p>
      </div>
    </Dialog>
  );
};
