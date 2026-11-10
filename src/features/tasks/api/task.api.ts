import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskProgressStatus,
  TaskPriority,
  AssigneeStatus,
} from '../types/task.types';

// ── Response envelopes (internal, unwrapped before returning) ──
interface TasksResponse {
  message?: string;
  tasks: Task[];
}

interface TaskResponse {
  message?: string;
  task: Task;
}

export interface GetSpaceTasksParams {
  status?: TaskProgressStatus;
  assignee?: string;
  priority?: TaskPriority;
}

// ── API functions ──

export async function getSpaceTasks(
  spaceId: string,
  params?: GetSpaceTasksParams,
): Promise<Task[]> {
  const queryParams: Record<string, string | undefined> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.assignee) queryParams.assignee = params.assignee;
  if (params?.priority) queryParams.priority = params.priority;

  const response = await http.get<TasksResponse>(API_ENDPOINTS.SPACES.TASKS(spaceId), {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });
  return response.tasks;
}

export async function getTaskById(id: string): Promise<Task> {
  const response = await http.get<TaskResponse>(API_ENDPOINTS.TASKS.BY_ID(id));
  return response.task;
}

export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response = await http.post<TaskResponse>(API_ENDPOINTS.TASKS.CREATE, data);
  return response.task;
}

export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const response = await http.patch<TaskResponse>(API_ENDPOINTS.TASKS.UPDATE(id), data);
  return response.task;
}

export async function deleteTask(id: string): Promise<Task> {
  const response = await http.delete<TaskResponse>(API_ENDPOINTS.TASKS.DELETE(id));
  return response.task;
}

export async function addAssignee(taskId: string, userId: string): Promise<Task> {
  const response = await http.post<TaskResponse>(API_ENDPOINTS.TASKS.ADD_ASSIGNEE(taskId), {
    userId,
  });
  return response.task;
}

export async function removeAssignee(taskId: string, userId: string): Promise<Task> {
  const response = await http.delete<TaskResponse>(
    API_ENDPOINTS.TASKS.REMOVE_ASSIGNEE(taskId, userId),
  );
  return response.task;
}

export async function updateMyAssigneeStatus(
  taskId: string,
  status: AssigneeStatus,
): Promise<Task> {
  const response = await http.patch<TaskResponse>(API_ENDPOINTS.TASKS.UPDATE_MY_STATUS(taskId), {
    status,
  });
  return response.task;
}
