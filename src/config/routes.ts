export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // App
  OVERVIEW: '/app',
  MY_TASKS: '/app/my-tasks',
  NOTIFICATIONS: '/app/notifications',
  SETTINGS: '/app/settings',

  // Spaces
  SPACES: '/app/spaces',
  SPACE: (id: string) => `/app/spaces/${id}` as const,
  CREATE_SPACE: '/app/spaces/new',

  // Profile
  PROFILE: (id: string) => `/u/${id}` as const,

  // Public space
  PUBLIC_SPACE: (id: string) => `/s/${id}` as const,

  // Invite
  INVITE_PREVIEW: (token: string) => `/invite/${token}` as const,
} as const;