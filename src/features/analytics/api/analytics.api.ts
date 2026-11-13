import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type {
  AnalyticsPoint,
  AnalyticsRange,
  CompletionByMember,
  SpaceAnalytics,
  WorkloadByMember,
} from '../types/analytics.types';

interface AnalyticsResponse {
  analytics: {
    range: AnalyticsRange;
    startDate: string;
    endDate: string;
    tasksCompletedPerDay: AnalyticsPoint[];
    completionByMember: CompletionByMember[];
    onTimeRate: number;
    workloadPerMember: WorkloadByMember[];
    overdueCount: number;
  };
}

interface DistributeTasksResponse {
  updatedCount: number;
}

interface DistributionUndoStatusResponse {
  canUndo: boolean;
}

function normalizeDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return value.slice(0, 10);
}

export async function getSpaceAnalytics(
  spaceId: string,
  range: AnalyticsRange,
): Promise<SpaceAnalytics> {
  // The backend checks the space owner's plan. A 402 response remains authoritative.
  // Backend dates are calendar dates serialized as ISO values; retaining the first ten
  // characters prevents local timezone conversion from shifting a day.
  const response = await http.get<AnalyticsResponse>(API_ENDPOINTS.SPACES.ANALYTICS(spaceId), {
    params: { range },
  });
  const analytics = response.analytics;
  return {
    ...analytics,
    startDate: normalizeDate(analytics.startDate),
    endDate: normalizeDate(analytics.endDate),
    tasksCompletedPerDay: analytics.tasksCompletedPerDay.map((point) => ({
      date: normalizeDate(point.date),
      count: point.count,
    })),
    onTimeRate:
      typeof analytics.onTimeRate === 'number'
        ? Math.max(
            0,
            Math.min(
              100,
              analytics.onTimeRate <= 1 ? analytics.onTimeRate * 100 : analytics.onTimeRate,
            ),
          )
        : null,
  };
}

export async function distributeTasksEqually(spaceId: string): Promise<DistributeTasksResponse> {
  return http.post<DistributeTasksResponse>(API_ENDPOINTS.SPACES.DISTRIBUTE_TASKS(spaceId));
}

export async function getDistributionUndoStatus(
  spaceId: string,
): Promise<DistributionUndoStatusResponse> {
  return http.get<DistributionUndoStatusResponse>(API_ENDPOINTS.SPACES.DISTRIBUTION_UNDO(spaceId));
}

export async function undoTaskDistribution(spaceId: string): Promise<{ restoredCount: number }> {
  return http.post<{ restoredCount: number }>(API_ENDPOINTS.SPACES.DISTRIBUTION_UNDO(spaceId));
}
