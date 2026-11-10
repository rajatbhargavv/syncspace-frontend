export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    ME: '/api/users/me',
    BY_ID: (id: string) => `/api/users/${id}`,
    PROFILE: (id: string) => `/api/users/${id}/profile`,
    UPDATE: '/api/users/update',
    DEACTIVATE: '/api/users/deactivate',
    UPDATE_PLAN: '/api/users/plan',
  },
  SPACES: {
    LIST: '/api/spaces',
    CREATE: '/api/spaces',
    BY_ID: (id: string) => `/api/spaces/${id}`,
    PUBLIC: (id: string) => `/api/spaces/public/${id}`,
    UPDATE: (id: string) => `/api/spaces/${id}`,
    DEACTIVATE: (id: string) => `/api/spaces/${id}/deactivate`,
    TASKS: (id: string) => `/api/spaces/${id}/tasks`,
    ANALYTICS: (id: string) => `/api/spaces/${id}/analytics`,
    INVITES: (id: string) => `/api/spaces/${id}/invites`,
    MEMBERS: (id: string) => `/api/spaces/${id}/members`,
    JOIN: (id: string) => `/api/spaces/${id}/join`,
    LEAVE: (id: string) => `/api/spaces/${id}/leave`,
    REMOVE_MEMBER: (spaceId: string, userId: string) => `/api/spaces/${spaceId}/members/${userId}`,
    APPROVE_MEMBER: (spaceId: string, userId: string) =>
      `/api/spaces/${spaceId}/members/${userId}/approve`,
    REJECT_MEMBER: (spaceId: string, userId: string) =>
      `/api/spaces/${spaceId}/members/${userId}/reject`,
  },
  TASKS: {
    CREATE: '/api/tasks',
    BY_ID: (id: string) => `/api/tasks/${id}`,
    UPDATE: (id: string) => `/api/tasks/${id}`,
    DELETE: (id: string) => `/api/tasks/${id}`,
    ADD_ASSIGNEE: (id: string) => `/api/tasks/${id}/assignees`,
    REMOVE_ASSIGNEE: (taskId: string, userId: string) => `/api/tasks/${taskId}/assignees/${userId}`,
    UPDATE_MY_STATUS: (id: string) => `/api/tasks/${id}/assignees/me`,
    SUBTASKS: (taskId: string) => `/api/tasks/${taskId}/subtasks`,
    COMMENTS: (taskId: string) => `/api/tasks/${taskId}/comments`,
    TIMELINE: (taskId: string) => `/api/tasks/${taskId}/timeline`,
  },
  SUBTASKS: {
    UPDATE: (id: string) => `/api/subtasks/${id}`,
    DELETE: (id: string) => `/api/subtasks/${id}`,
  },
  COMMENTS: {
    UPDATE: (id: string) => `/api/comments/${id}`,
    DELETE: (id: string) => `/api/comments/${id}`,
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    UNREAD_COUNT: '/api/notifications/unread-count',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/read-all',
  },
  INVITES: {
    JOIN: (token: string) => `/api/spaces/join/${token}`,
    PREVIEW: (token: string) => `/api/spaces/invite/${token}/preview`,
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
} as const;

export const TASK_PROGRESS_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export const ASSIGNEE_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export const SPACE_KIND = {
  OUR_HOME: 'OUR_HOME',
  BUILDERS_CIRCLE: 'BUILDERS_CIRCLE',
  STUDIO: 'STUDIO',
  MY_CORNER: 'MY_CORNER',
  CUSTOM: 'CUSTOM',
} as const;

export const THEME_PRESET = {
  HEARTH: 'HEARTH',
  NEON_GRID: 'NEON_GRID',
  IVORY_INK: 'IVORY_INK',
  ORBIT: 'ORBIT',
} as const;

export const THEME_MODE = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const VISIBILITY = {
  PRIVATE: 'PRIVATE',
  UNLISTED: 'UNLISTED',
  PUBLIC: 'PUBLIC',
} as const;

export const JOIN_POLICY = {
  INVITE_ONLY: 'INVITE_ONLY',
  REQUEST: 'REQUEST',
  OPEN: 'OPEN',
} as const;

export const SPACE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export const MEMBER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export const MEMBER_ROLE = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const;

export const USER_PLAN = {
  FREE: 'FREE',
  PRO: 'PRO',
} as const;

export const NOTIFICATION_TYPE = {
  TASK_COMMENT: 'TASK_COMMENT',
  TASK_CREATED: 'TASK_CREATED',
  SPACE_MEMBER_JOINED: 'SPACE_MEMBER_JOINED',
  SPACE_MEMBER_LEFT: 'SPACE_MEMBER_LEFT',
  SUBTASK_CREATED: 'SUBTASK_CREATED',
  ASSIGNEE_TASK_COMPLETED: 'ASSIGNEE_TASK_COMPLETED',
  ASSIGNEE_SUBTASK_COMPLETED: 'ASSIGNEE_SUBTASK_COMPLETED',
} as const;

export const RESOURCE_TYPE = {
  SPACE: 'SPACE',
  COMMENT: 'COMMENT',
  TASK: 'TASK',
  SUBTASK: 'SUBTASK',
} as const;

export const SUBTASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
} as const;

export const COMMENT_MAX_LENGTH = 2000;
