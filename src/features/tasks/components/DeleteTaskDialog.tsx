import React from 'react';
import { toast } from 'sonner';
import { Button, Dialog } from '@/components/ui';
import { ApiError } from '@/lib/http/ApiError';
import { useDeleteTask } from '../hooks/useDeleteTask';
import type { Task } from '../types/task.types';

export interface DeleteTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  task,
  open,
  onOpenChange,
  onDeleted,
}) => {
  const deletion = useDeleteTask();
  return (
    <Dialog isOpen={open} onClose={() => onOpenChange(false)} title="Delete task" size="sm">
      <p className="text-sm text-text-muted">
        Delete &quot;{task.title}&quot;? This action cannot be undone.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="danger"
          isLoading={deletion.isPending}
          onClick={() =>
            deletion.mutate(
              { taskId: task._id, spaceId: task.spaceId },
              {
                onSuccess: () => {
                  toast.success('Task deleted');
                  onOpenChange(false);
                  onDeleted();
                },
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError && error.isForbidden
                      ? 'You do not have permission to delete this task.'
                      : error.message,
                  ),
              },
            )
          }
        >
          Delete
        </Button>
      </div>
    </Dialog>
  );
};
