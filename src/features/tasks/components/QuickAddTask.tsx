import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCreateTask } from '../hooks/useCreateTask';
import type { TaskProgressStatus } from '../types/task.types';

interface QuickAddTaskProps {
  spaceId: string;
  disabled?: boolean;
  status?: TaskProgressStatus;
}

function endOfToday(): string {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({ spaceId, disabled, status = 'TODO' }) => {
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const createTask = useCreateTask();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const cancel = () => {
    setTitle('');
    setIsEditing(false);
  };

  const submit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || createTask.isPending) return;
    await createTask.mutateAsync({
      spaceId,
      title: trimmedTitle,
      priority: 'MEDIUM',
      deadline: endOfToday(),
      progressStatus: status,
    });
    cancel();
  };

  if (disabled) return null;
  if (!isEditing) {
    return (
      <button
        type="button"
        className="mt-2 flex w-full items-center gap-2 rounded-button border border-dashed border-border px-3 py-2 text-left text-xs text-text-muted hover:border-accent hover:text-accent"
        onClick={() => setIsEditing(true)}
      >
        <span aria-hidden="true">+</span> Add task
      </button>
    );
  }

  return (
    <div className="border-accent/40 mt-2 rounded-card border bg-surface p-2">
      <label htmlFor="quick-add-task" className="sr-only">
        Task title
      </label>
      <input
        id="quick-add-task"
        ref={inputRef}
        value={title}
        maxLength={100}
        placeholder="Task title"
        disabled={createTask.isPending}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit();
          if (event.key === 'Escape') cancel();
        }}
        className="w-full rounded-input border border-border bg-bg px-2.5 py-2 text-sm text-text outline-none focus:border-accent"
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={cancel}>
          Cancel
        </Button>
        <Button size="sm" isLoading={createTask.isPending} onClick={() => void submit()}>
          Add
        </Button>
      </div>
    </div>
  );
};
