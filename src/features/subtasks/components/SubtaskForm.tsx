import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { useMemberLookup } from '@/features/tasks';
import { useCreateSubtask } from '../hooks/useSubtaskMutations';
import { createSubtaskSchema, type CreateSubtaskFormValues } from '../schemas/subtask.schema';

export interface SubtaskFormProps {
  taskId: string;
  spaceId: string;
  onCreated?: () => void;
}

export const SubtaskForm: React.FC<SubtaskFormProps> = ({ taskId, spaceId, onCreated }) => {
  const { members } = useMemberLookup(spaceId);
  const create = useCreateSubtask();
  const form = useForm<CreateSubtaskFormValues>({
    resolver: zodResolver(createSubtaskSchema),
    defaultValues: {
      taskId,
      title: '',
      description: '',
      priority: 'MEDIUM',
      assigneeId: '',
      deadline: endOfToday(),
    },
  });

  useEffect(() => {
    if (!form.getValues('assigneeId') && members[0]) {
      form.setValue('assigneeId', members[0]._id);
    }
  }, [form, members]);

  const submit = form.handleSubmit(async (values) => {
    try {
      await create.mutateAsync({
        taskId,
        title: values.title,
        description: values.description,
        assigneeId: values.assigneeId,
        priority: values.priority,
        deadline: new Date(values.deadline).toISOString(),
      });
      form.reset({
        taskId,
        title: '',
        description: '',
        priority: 'MEDIUM',
        assigneeId: values.assigneeId,
        deadline: endOfToday(),
      });
      onCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create subtask');
    }
  });

  return (
    <form className="space-y-3 rounded-card border border-border p-3" onSubmit={submit}>
      <h4 className="text-sm font-semibold text-text">Add subtask</h4>
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
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Assignee"
          options={members.map((member) => ({ value: member._id, label: member.name }))}
          error={form.formState.errors.assigneeId?.message}
          {...form.register('assigneeId')}
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
      </div>
      <Input
        label="Deadline"
        type="datetime-local"
        error={form.formState.errors.deadline?.message}
        {...form.register('deadline')}
      />
      <Button type="submit" size="sm" isLoading={create.isPending}>
        Add subtask
      </Button>
    </form>
  );
};

function endOfToday(): string {
  const date = new Date();
  date.setHours(23, 59, 0, 0);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
