export type AnalyticsRange = '7d' | '30d' | '90d';

export interface AnalyticsPoint {
  date: string;
  count: number;
}

export interface CompletionByMember {
  userId: string;
  name: string;
  completedCount: number;
}

export interface WorkloadByMember {
  userId: string;
  name: string;
  activeTasksCount: number;
}

export interface SpaceAnalytics {
  range: AnalyticsRange;
  startDate: string;
  endDate: string;
  tasksCompletedPerDay: AnalyticsPoint[];
  completionByMember: CompletionByMember[];
  onTimeRate: number | null;
  workloadPerMember: WorkloadByMember[];
  overdueCount: number;
}

export type AnalyticsState = 'locked' | 'ready' | 'empty' | 'error';
