// ── Task Types ──
export type {
  TaskPriority,
  TaskProgressStatus,
  AssigneeStatus,
  TaskLifecycleStatus,
  TaskAssignee,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  AddAssigneeInput,
  UpdateMyAssigneeStatusInput,
  TaskFilters,
} from './types/task.types';

// ── Task Schemas ──
export {
  taskPrioritySchema,
  taskProgressStatusSchema,
  assigneeStatusSchema,
  createTaskSchema,
  updateTaskSchema,
  addAssigneeSchema,
  updateAssigneeStatusSchema,
  type CreateTaskFormValues,
  type UpdateTaskFormValues,
  type AddAssigneeFormValues,
  type UpdateAssigneeStatusFormValues,
} from './schemas/task.schema';

// ── Task API ──
export {
  getSpaceTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addAssignee,
  removeAssignee,
  updateMyAssigneeStatus,
  type GetSpaceTasksParams,
} from './api/task.api';

// ── Task Hooks ──
export { useSpaceTasks } from './hooks/useSpaceTasks';
export { useTask } from './hooks/useTask';
export { useCreateTask } from './hooks/useCreateTask';
export { useUpdateTask, type UpdateTaskVariables } from './hooks/useUpdateTask';
export { useUpdateTaskStatus, type UpdateTaskStatusVariables } from './hooks/useUpdateTaskStatus';
export { useDeleteTask, type DeleteTaskVariables } from './hooks/useDeleteTask';
export {
  useAddAssignee,
  useRemoveAssignee,
  useUpdateMyAssigneeStatus,
  type AddAssigneeVariables,
  type RemoveAssigneeVariables,
  type UpdateMyAssigneeStatusVariables,
} from './hooks/useAssigneeMutations';
export { useTaskFilters } from './hooks/useTaskFilters';
export { useFilteredTasks } from './hooks/useFilteredTasks';
export { useSpaceView, type SpaceViewType } from './hooks/useSpaceView';
export { useOpenTask } from './hooks/useOpenTask';
export {
  useMemberLookup,
  type MemberLookupResult,
  type SimpleMember,
} from './hooks/useMemberLookup';

// ── Task Utils ──
export {
  groupTasksByStatus,
  sortTasks,
  filterTasks,
  isOverdue,
  formatDeadline,
  priorityMeta,
  statusMeta,
  computeWorkload,
  PRIORITY_ORDER,
  type PriorityMeta,
  type StatusMetaItem,
} from './utils/taskUtils';

// ── Task Components (Contract Placeholders & Exports) ──
export { BoardView, type BoardViewProps } from './components/BoardView';
export { WorkloadStrip, type WorkloadStripProps } from './components/WorkloadStrip';
export { TaskCard, type TaskCardProps } from './components/TaskCard';
export { TaskDrawer, type TaskDrawerProps } from './components/TaskDrawer';
export { CreateTaskDialog, type CreateTaskDialogProps } from './components/CreateTaskDialog';
export { TaskDiscussionSlot, type TaskDiscussionSlotProps } from './components/TaskDiscussionSlot';
export { TaskHeaderEditor, type TaskHeaderEditorProps } from './components/TaskHeaderEditor';
export { TaskMetaPanel, type TaskMetaPanelProps } from './components/TaskMetaPanel';
export { AssigneePicker, type AssigneePickerProps } from './components/AssigneePicker';
export { DeleteTaskDialog, type DeleteTaskDialogProps } from './components/DeleteTaskDialog';
export { ListView, type ListViewProps } from './components/ListView';
export { CalendarView, type CalendarViewProps } from './components/CalendarView';
export { TaskFilterBar, type TaskFilterBarProps } from './components/TaskFilterBar';
export { MyTasksPage } from './pages/MyTasksPage';
