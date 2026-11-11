import { describe, expect, it } from 'vitest';
import {
  bucketForChart,
  busiestWeekday,
  fillMissingDays,
  shareOf,
  workloadConcentration,
} from './analyticsUtils';

describe('analyticsUtils', () => {
  it('fills missing calendar days with zero counts', () => {
    expect(fillMissingDays([{ date: '2025-01-02', count: 3 }], '2025-01-01', '2025-01-03')).toEqual(
      [
        { date: '2025-01-01', count: 0 },
        { date: '2025-01-02', count: 3 },
        { date: '2025-01-03', count: 0 },
      ],
    );
  });

  it('rounds member shares to a total of 100 percent', () => {
    expect(
      shareOf([
        { userId: 'a', name: 'A', completedCount: 1 },
        { userId: 'b', name: 'B', completedCount: 1 },
        { userId: 'c', name: 'C', completedCount: 1 },
      ]).map((member) => member.percentage),
    ).toEqual([34, 33, 33]);
  });

  it('groups 90-day data by Monday week buckets', () => {
    expect(
      bucketForChart(
        [
          { date: '2025-01-06', count: 2 },
          { date: '2025-01-07', count: 3 },
        ],
        '90d',
      ),
    ).toEqual([{ date: '2025-01-06', count: 5 }]);
  });

  it('returns the busiest weekday and workload concentration', () => {
    expect(
      busiestWeekday([
        { date: '2025-01-06', count: 2 },
        { date: '2025-01-13', count: 1 },
      ]),
    ).toBe('Monday');
    expect(
      workloadConcentration([
        { userId: 'a', name: 'A', activeTasksCount: 3 },
        { userId: 'b', name: 'B', activeTasksCount: 1 },
      ]),
    ).toEqual({
      member: { userId: 'a', name: 'A', activeTasksCount: 3 },
      percentage: 75,
    });
  });
});
