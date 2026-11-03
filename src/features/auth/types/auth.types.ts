import { USER_PLAN } from '@/config/constants';

export type UserPlan = (typeof USER_PLAN)[keyof typeof USER_PLAN];

export interface User {
  _id: string;
  name: string;
  email: string;
  plan: UserPlan;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  accessToken?: string;
  user?: Partial<User>;
}

export interface MeResponse {
  message: string;
  user: User;
}
