import React, { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Dialog, Input, Select, TagInput, Textarea } from '@/components/ui';
import { useSpaceMembers } from '@/features/members';
import { useAddAssignee } from '../hooks/useAssigneeMutations';
import { useCreateTask } from '../hooks/useCreateTask';
import { useUpdateTaskStatus } from '../hooks/useUpdateTaskStatus';
import { createTaskSchema, type CreateTaskFormValues } from '../schemas/task.schema';
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
  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      spaceId,
      title: '',
      description: '',
      tags: [],
      priority: 'MEDIUM',
      deadline: endOfToday(),
      assignees: [],
    },
  });
  const members = useSpaceMembers(spaceId);
  const create = useCreateTask();
  const addAssignee = useAddAssignee();
  const updateStatus = useUpdateTaskStatus();
  const activeMembers = useMemo(
    () => (members.data ?? []).filter((member) => member.status === 'ACTIVE'),
    [members.data],
  );

  useEffect(() => {
    if (open) {
      form.reset({
        spaceId,
        title: '',
        description: '',
        tags: [],
        priority: 'MEDIUM',
        deadline: endOfToday(),
        assignees: [],
      });
    }
  }, [form, open, spaceId]);

  const submit = form.handleSubmit(async (values) => {
    const selectedAssignees = values.assignees;
    try {
      const task = await create.mutateAsync({
        spaceId,
        title: values.title,
        description: values.description,
        tags: values.tags,
        priority: values.priority,
        deadline: new Date(values.deadline).toISOString(),
      });
      for (const userId of selectedAssignees) {
        await addAssignee.mutateAsync({ taskId: task._id, userId, spaceId });
      }
      if (defaultStatus !== 'TODO') {
        await updateStatus.mutateAsync({
          taskId: task._id,
          progressStatus: defaultStatus,
          spaceId,
        });
      }
      toast.success('Task created');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create task');
    }
  });

  return (
    <Dialog isOpen={open} onClose={() => onOpenChange(false)} title="Create task" size="md">
      <form data-testid="create-task-dialog-content" className="space-y-4" onSubmit={submit}>
        <Input
          label="Title"
          error={form.formState.errors.title?.message}
          {...form.register('title')}
        />
        <Textarea
          label="Description"
          error={form.formState.errors.description?.message}
          {...form.register('description')}
        />
        <TagInput
          label="Tags"
          placeholder="e.g. inventory module, billing"
          helperText="Press Enter or comma to add tags to classify this task"
          value={form.watch('tags') ?? []}
          onChange={(tags) =>
            form.setValue('tags', tags, { shouldValidate: true, shouldDirty: true })
          }
          error={form.formState.errors.tags?.message}
        />
        <Select
          label="Priority"
          options={[
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
          ]}
          {...form.register('priority')}
        />
        <Input
          label="Deadline"
          type="datetime-local"
          error={form.formState.errors.deadline?.message}
          {...form.register('deadline')}
        />
        {activeMembers.length > 0 && (
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-text">Assignees</legend>
            <div className="max-h-32 space-y-2 overflow-y-auto">
              {activeMembers.map((member) => (
                <label
                  key={member.userId._id}
                  className="flex items-center gap-2 text-sm text-text"
                >
                  <input
                    type="checkbox"
                    value={member.userId._id}
                    {...form.register('assignees')}
                  />
                  {member.userId.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={create.isPending || addAssignee.isPending || updateStatus.isPending}
          >
            Create task
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

function endOfToday(): string {
  const date = new Date();
  date.setHours(23, 59, 0, 0);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
