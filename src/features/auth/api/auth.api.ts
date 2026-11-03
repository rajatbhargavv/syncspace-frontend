import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type {
  AuthResponse,
  LoginInput,
  MeResponse,
  RegisterInput,
  User,
} from '../types/auth.types';

export async function register(data: RegisterInput): Promise<AuthResponse> {
  return http.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
}

export async function login(data: LoginInput): Promise<AuthResponse> {
  return http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
}

export async function logout(): Promise<{ message: string }> {
  return http.post<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT);
}

export async function getCurrentUser(): Promise<User> {
  const response = await http.get<MeResponse>(API_ENDPOINTS.USERS.ME);
  return response.user;
}

export async function refresh(): Promise<AuthResponse> {
  return http.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH);
}
