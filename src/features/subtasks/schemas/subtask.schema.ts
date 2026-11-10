import { z } from 'zod';
import { SUBTASK_STATUS, TASK_PRIORITY } from '@/config/constants';

// ── Enum schemas ──
export const subtaskStatusSchema = z.enum([
  SUBTASK_STATUS.TODO,
  SUBTASK_STATUS.IN_PROGRESS,
  SUBTASK_STATUS.DONE,
]);

export const subtaskPrioritySchema = z.enum([
  TASK_PRIORITY.LOW,
  TASK_PRIORITY.MEDIUM,
  TASK_PRIORITY.HIGH,
  TASK_PRIORITY.URGENT,
]);

// ── Create Subtask ──
export const createSubtaskSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required').optional(),
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
  assigneeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Assignee must be a valid 24-character ID'),
  priority: subtaskPrioritySchema.default(TASK_PRIORITY.MEDIUM),
  deadline: z
    .string()
    .min(1, 'Deadline is required')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid deadline format',
    }),
});

export type CreateSubtaskFormValues = z.infer<typeof createSubtaskSchema>;

// ── Update Subtask ──
export const updateSubtaskSchema = z
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
    assigneeId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Assignee must be a valid 24-character ID')
      .optional(),
    priority: subtaskPrioritySchema.optional(),
    deadline: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid deadline format',
      })
      .optional(),
    status: subtaskStatusSchema.optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.assigneeId !== undefined ||
      data.priority !== undefined ||
      data.deadline !== undefined ||
      data.status !== undefined,
    { message: 'At least one field must be provided for update' },
  );

export type UpdateSubtaskFormValues = z.infer<typeof updateSubtaskSchema>;
