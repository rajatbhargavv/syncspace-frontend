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
