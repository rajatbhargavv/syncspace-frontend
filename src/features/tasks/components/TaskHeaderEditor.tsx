import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Textarea } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { updateTaskSchema } from '../schemas/task.schema';
import { useUpdateTask } from '../hooks/useUpdateTask';
import type { Task } from '../types/task.types';

export interface TaskHeaderEditorProps {
  task: Task;
  readOnly?: boolean;
}

type EditingField = 'title' | 'description' | null;

export const TaskHeaderEditor: React.FC<TaskHeaderEditorProps> = ({ task, readOnly = false }) => {
  const [editing, setEditing] = useState<EditingField>(null);
  const [value, setValue] = useState('');
  const update = useUpdateTask();

  useEffect(() => {
    if (!editing) return;
    setValue(editing === 'title' ? task.title : (task.description ?? ''));
  }, [editing, task.description, task.title]);

  const cancel = () => {
    setEditing(null);
    setValue('');
  };

  const save = () => {
    if (!editing) return;
    const field = editing;
    const nextValue = value.trim();
    const currentValue = field === 'title' ? task.title : (task.description ?? '');
    if (nextValue === currentValue) {
      cancel();
      return;
    }

    const result = updateTaskSchema.safeParse({ [field]: nextValue });
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid task details');
      return;
    }

    update.mutate(
      { id: task._id, data: { [field]: nextValue }, spaceId: task.spaceId },
      {
        onSuccess: cancel,
        onError: (error) => toast.error(error.message || 'Unable to update task'),
      },
    );
  };

  if (editing) {
    return (
      <div className="space-y-2">
        {editing === 'title' ? (
          <Input
            aria-label="Task title"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') save();
              if (event.key === 'Escape') cancel();
            }}
            onBlur={save}
            disabled={update.isPending}
          />
        ) : (
          <Textarea
            aria-label="Task description"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') cancel();
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) save();
            }}
            onBlur={save}
            disabled={update.isPending}
          />
        )}
        {editing === 'description' && (
          <Button size="sm" onClick={save} disabled={update.isPending}>
            Save
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="w-full text-left font-heading text-xl font-semibold text-text focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default"
        onClick={() => !readOnly && setEditing('title')}
        disabled={readOnly}
        aria-label={readOnly ? undefined : 'Edit task title'}
      >
        {task.title}
      </button>
      <button
        type="button"
        className="w-full whitespace-pre-wrap text-left text-sm text-text-muted focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default"
        onClick={() => !readOnly && setEditing('description')}
        disabled={readOnly}
        aria-label={readOnly ? undefined : 'Edit task description'}
      >
        {task.description || (readOnly ? 'No description' : 'Add a description')}
      </button>
    </div>
  );
};
