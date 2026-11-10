import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type { Subtask, CreateSubtaskInput, UpdateSubtaskInput } from '../types/subtask.types';

// ── Response envelopes ──
interface SubtasksResponse {
  message?: string;
  subtasks: Subtask[];
}

interface SubtaskResponse {
  message?: string;
  subtask: Subtask;
}

// ── API functions ──

export async function getSubtasks(taskId: string): Promise<Subtask[]> {
  const response = await http.get<SubtasksResponse>(API_ENDPOINTS.TASKS.SUBTASKS(taskId));
  return response.subtasks;
}

export async function createSubtask(
  taskId: string,
  data: Omit<CreateSubtaskInput, 'taskId'>,
): Promise<Subtask> {
  const response = await http.post<SubtaskResponse>(API_ENDPOINTS.TASKS.SUBTASKS(taskId), data);
  return response.subtask;
}

export async function updateSubtask(id: string, data: UpdateSubtaskInput): Promise<Subtask> {
  const response = await http.patch<SubtaskResponse>(API_ENDPOINTS.SUBTASKS.UPDATE(id), data);
  return response.subtask;
}

export async function deleteSubtask(id: string): Promise<Subtask> {
  const response = await http.delete<SubtaskResponse>(API_ENDPOINTS.SUBTASKS.DELETE(id));
  return response.subtask;
}
