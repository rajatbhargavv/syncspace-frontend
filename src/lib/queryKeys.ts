export interface TaskFilters {
  status?: string;
  assignee?: string;
  priority?: string;
}

export interface NotificationFilters {
  unread?: boolean;
  page?: number;
  limit?: number;
}

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  users: {
    all: ['users'] as const,
    byId: (id: string) => [...queryKeys.users.all, id] as const,
    profile: (id: string) => [...queryKeys.users.all, id, 'profile'] as const,
  },

  spaces: {
    all: ['spaces'] as const,
    list: () => [...queryKeys.spaces.all, 'list'] as const,
    byId: (id: string) => [...queryKeys.spaces.all, id] as const,
    public: (id: string) => [...queryKeys.spaces.all, 'public', id] as const,
    members: (id: string) => [...queryKeys.spaces.all, id, 'members'] as const,
    analytics: (id: string, range?: string) =>
      [...queryKeys.spaces.all, id, 'analytics', range ?? '30d'] as const,
  },

  members: {
    all: ['members'] as const,
    bySpace: (spaceId: string) => [...queryKeys.members.all, spaceId] as const,
  },

  tasks: {
    all: ['tasks'] as const,
    bySpace: (spaceId: string, filters?: TaskFilters) =>
      [...queryKeys.tasks.all, 'space', spaceId, filters ?? {}] as const,
    byId: (id: string) => [...queryKeys.tasks.all, id] as const,
    detail: (id: string) => [...queryKeys.tasks.all, id] as const,
    subtasks: (taskId: string) => [...queryKeys.tasks.all, taskId, 'subtasks'] as const,
    comments: (taskId: string) => [...queryKeys.tasks.all, taskId, 'comments'] as const,
    timeline: (taskId: string) => [...queryKeys.tasks.all, taskId, 'timeline'] as const,
  },

  subtasks: {
    all: ['subtasks'] as const,
    byTask: (taskId: string) => [...queryKeys.subtasks.all, 'task', taskId] as const,
    detail: (id: string) => [...queryKeys.subtasks.all, id] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: (filters?: NotificationFilters) =>
      [...queryKeys.notifications.all, 'list', filters ?? {}] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },

  invites: {
    all: ['invites'] as const,
    preview: (token: string) => [...queryKeys.invites.all, 'preview', token] as const,
  },
} as const;
