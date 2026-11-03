export interface ApiResponse<T = unknown> {
  message: string;
  [key: string]: T | string | undefined;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type Id = string;