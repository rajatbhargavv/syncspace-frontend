import { addDays, format, isValid, parseISO } from 'date-fns';
import type {
  AnalyticsPoint,
  AnalyticsRange,
  CompletionByMember,
  WorkloadByMember,
} from '../types/analytics.types';

export function fillMissingDays(
  points: AnalyticsPoint[],
  startDate: string,
  endDate: string,
): AnalyticsPoint[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  if (!isValid(start) || !isValid(end)) return points;
  const byDate = new Map(points.map((point) => [point.date, point.count]));
  const result: AnalyticsPoint[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    const key = format(date, 'yyyy-MM-dd');
    result.push({ date: key, count: byDate.get(key) ?? 0 });
  }
  return result;
}

export function sumCompleted(points: AnalyticsPoint[]): number {
  return points.reduce((total, point) => total + point.count, 0);
}

export interface MemberShare extends CompletionByMember {
  percentage: number;
}

export function shareOf(members: CompletionByMember[]): MemberShare[] {
  const total = members.reduce((sum, member) => sum + member.completedCount, 0);
  if (total === 0) return members.map((member) => ({ ...member, percentage: 0 }));
  const raw = members.map((member) => (member.completedCount / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - (floors[index] ?? 0) }))
    .sort((a, b) => b.fraction - a.fraction);
  const percentages = [...floors];
  for (const item of order) {
    if (remainder <= 0) break;
    percentages[item.index] = (percentages[item.index] ?? 0) + 1;
    remainder -= 1;
  }
  return members.map((member, index) => ({ ...member, percentage: percentages[index] ?? 0 }));
}

export function bucketForChart(points: AnalyticsPoint[], range: AnalyticsRange): AnalyticsPoint[] {
  if (range !== '90d') return points;
  const buckets = new Map<string, number>();
  for (const point of points) {
    const date = parseISO(point.date);
    const day = date.getDay();
    const monday = addDays(date, day === 0 ? -6 : 1 - day);
    const key = format(monday, 'yyyy-MM-dd');
    buckets.set(key, (buckets.get(key) ?? 0) + point.count);
  }
  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}

export function busiestWeekday(points: AnalyticsPoint[]): string | null {
  const totals = new Map<number, number>();
  for (const point of points) {
    const weekday = parseISO(point.date).getDay();
    totals.set(weekday, (totals.get(weekday) ?? 0) + point.count);
  }
  const winner = [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
  return winner && winner[1] > 0
    ? (['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][winner[0]] ??
        null)
    : null;
}

export function workloadConcentration(workload: WorkloadByMember[]): {
  member: WorkloadByMember | null;
  percentage: number;
} {
  const total = workload.reduce((sum, member) => sum + member.activeTasksCount, 0);
  const member = [...workload].sort((a, b) => b.activeTasksCount - a.activeTasksCount)[0] ?? null;
  return { member, percentage: member && total > 0 ? (member.activeTasksCount / total) * 100 : 0 };
}
