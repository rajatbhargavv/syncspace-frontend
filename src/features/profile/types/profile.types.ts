import type { SpaceKind, SpaceTheme } from '@/features/spaces/types/space.types';

export interface ProfileSpace {
  _id: string;
  name: string;
  role: 'OWNER' | 'MEMBER';
  stats: { tasksCompleted: number; contributionShare: number };
  description?: string;
  kind?: SpaceKind;
  theme?: SpaceTheme;
  memberCount?: number;
  joinedAt?: string;
}

export interface UserProfile {
  name: string;
  joinedAt: string;
  totalTasksCompleted?: number;
  publicSpacesCount?: number;
  spaces: ProfileSpace[];
}
