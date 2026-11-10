import { env } from '@/config/env';
import { ApiError } from './ApiError';
import { refreshAccessToken } from './refresh';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const base = `${env.apiBaseUrl}${path}`;
  if (!params) return base;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `${base}?${qs}` : base;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const data = (await res.json()) as unknown;
    return data as T;
  }
  const text = await res.text();
  return text as unknown as T;
}

interface ErrorResponseBody {
  message?: string;
  details?: unknown;
}

function isErrorResponseBody(value: unknown): value is ErrorResponseBody {
  return typeof value === 'object' && value !== null && 'message' in value;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: customHeaders, ...rest } = options;

  const url = buildUrl(path, params);
  const headers = new Headers(customHeaders);

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...rest,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let res = await fetch(url, config);

  // 401 -> try single-flight refresh once, then retry the request once
  if (res.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await fetch(url, config);
    }
  }

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    let details: unknown;

    try {
      const errorBody: unknown = await parseResponse<unknown>(res);
      if (isErrorResponseBody(errorBody) && typeof errorBody.message === 'string') {
        message = errorBody.message;
        details = errorBody.details;
      }
    } catch {
      // Fallback to generic message
    }

    throw new ApiError(res.status, message, details);
  }

  return parseResponse<T>(res);
}

export const http = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'POST', body });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'PUT', body });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
} as const;
