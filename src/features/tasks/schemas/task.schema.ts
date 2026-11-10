import { z } from 'zod';
import { TASK_PRIORITY, TASK_PROGRESS_STATUS, ASSIGNEE_STATUS } from '@/config/constants';

// ── Enum schemas ──
export const taskPrioritySchema = z.enum([
  TASK_PRIORITY.LOW,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.URGENT,
]);

export const taskProgressStatusSchema = z.enum([
  TASK_PROGRESS_STATUS.TODO,
  TASK_PROGRESS_STATUS.IN_PROGRESS,
  TASK_PROGRESS_STATUS.COMPLETED,
]);

export const assigneeStatusSchema = z.enum([
  ASSIGNEE_STATUS.TODO,
  ASSIGNEE_STATUS.IN_PROGRESS,
  ASSIGNEE_STATUS.DONE,
]);

// ── Create Task ──
export const createTaskSchema = z.object({
  spaceId: z.string().min(1, 'Space ID is required'),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must be 2000 characters or less')
    .optional()
    .default(''),
  priority: taskPrioritySchema.default(TASK_PRIORITY.MEDIUM),
  deadline: z
    .string()
    .min(1, 'Deadline is required')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid deadline format',
    }),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

// ── Update Task ──
export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .max(100, 'Title must be 100 characters or less')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be 2000 characters or less')
      .optional(),
    priority: taskPrioritySchema.optional(),
    deadline: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid deadline format',
      })
      .optional(),
    progressStatus: taskProgressStatusSchema.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.priority !== undefined ||
      data.deadline !== undefined ||
      data.progressStatus !== undefined,
    { message: 'At least one field must be provided for update' },
  );

export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

// ── Assignee schemas ──
export const addAssigneeSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

export type AddAssigneeFormValues = z.infer<typeof addAssigneeSchema>;

export const updateAssigneeStatusSchema = z.object({
  status: assigneeStatusSchema,
});

export type UpdateAssigneeStatusFormValues = z.infer<typeof updateAssigneeStatusSchema>;
