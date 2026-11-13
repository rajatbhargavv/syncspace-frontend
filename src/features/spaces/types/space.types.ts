import {
  SPACE_KIND,
  THEME_PRESET,
  THEME_MODE,
  VISIBILITY,
  JOIN_POLICY,
  SPACE_STATUS,
  MEMBER_ROLE,
  SPACE_PERMISSION,
} from '@/config/constants';

// ── Enum-like union types (derived from backend constants) ──

export type SpaceKind = (typeof SPACE_KIND)[keyof typeof SPACE_KIND];
export type ThemePreset = (typeof THEME_PRESET)[keyof typeof THEME_PRESET];
export type ThemeMode = (typeof THEME_MODE)[keyof typeof THEME_MODE];
export type SpaceVisibility = (typeof VISIBILITY)[keyof typeof VISIBILITY];
export type SpaceJoinPolicy = (typeof JOIN_POLICY)[keyof typeof JOIN_POLICY];
export type SpaceStatus = (typeof SPACE_STATUS)[keyof typeof SPACE_STATUS];
export type MemberRole = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE];
export type SpacePermission = (typeof SPACE_PERMISSION)[keyof typeof SPACE_PERMISSION];

// ── Theme shape ──

export interface SpaceTheme {
  preset: ThemePreset;
  mode: ThemeMode;
}

// ── Space (full, returned when you are a member) ──

export interface Space {
  _id: string;
  name: string;
  description: string;
  kind: SpaceKind;
  theme: SpaceTheme;
  visibility: SpaceVisibility;
  joinPolicy: SpaceJoinPolicy;
  status: SpaceStatus;
  owner: string;
  ownerId?: string;
  assigneePermission?: SpacePermission;
  invitePermission?: SpacePermission;
  createdAt: string;
  updatedAt: string;
}

// ── SpaceSummary (list endpoint includes role + member count) ──

export interface SpaceSummary extends Space {
  myRole: MemberRole;
  memberCount: number;
}

// ── PublicSpace (returned by GET /spaces/public/:id, no auth) ──

export interface PublicSpace {
  _id: string;
  name: string;
  description: string;
  kind: SpaceKind;
  theme: SpaceTheme;
  visibility: SpaceVisibility;
  joinPolicy: SpaceJoinPolicy;
  status: SpaceStatus;
  createdAt: string;
  owner: {
    _id: string;
    name: string;
  };
  memberCount?: number;
  contributorStats: {
    totalContributors: number;
    totalTasks: number;
    completedTasks: number;
  };
  contributors?: Array<{
    userId: string;
    name: string;
    tasksCompleted: number;
    share: number;
  }>;
}

export interface DiscoverableSpace {
  _id: string;
  name: string;
  description: string;
  kind: SpaceKind;
  theme: SpaceTheme;
  visibility: 'PUBLIC';
  joinPolicy: SpaceJoinPolicy;
  owner: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ── Mutation inputs ──

export interface CreateSpaceInput {
  name: string;
  description?: string;
  kind: SpaceKind;
  theme: SpaceTheme;
  visibility: SpaceVisibility;
  joinPolicy: SpaceJoinPolicy;
}

export interface UpdateSpaceInput {
  name?: string;
  description?: string;
  status?: SpaceStatus;
  kind?: SpaceKind;
  theme?: SpaceTheme;
  visibility?: SpaceVisibility;
  joinPolicy?: SpaceJoinPolicy;
  assigneePermission?: SpacePermission;
  invitePermission?: SpacePermission;
}
