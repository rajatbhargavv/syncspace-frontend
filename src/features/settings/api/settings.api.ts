import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type { User, UserPlan } from '@/features/auth/types/auth.types';

export async function updateUser(data: {
  name?: string;
  email?: string;
  password?: string;
}): Promise<User> {
  const response = await http.patch<{ user: User }>(API_ENDPOINTS.USERS.UPDATE, data);
  return response.user;
}

export async function deactivateUser(): Promise<{ message: string }> {
  return http.delete<{ message: string }>(API_ENDPOINTS.USERS.DEACTIVATE);
}

export async function updatePlan(plan: UserPlan): Promise<User> {
  const response = await http.patch<{ user: User }>(API_ENDPOINTS.USERS.UPDATE_PLAN, { plan });
  return response.user;
}
