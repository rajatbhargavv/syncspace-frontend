import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge, Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApiError } from '@/types';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { useSpace, useSpaceTheme } from '@/features/spaces';
import { NotMemberScreen } from '@/features/spaces/components/NotMemberScreen';
import { usePublicSpace } from '@/features/spaces/hooks/usePublicSpace';
import { useSpaceTasks } from '@/features/tasks';
import { useOpenTask } from '@/features/tasks/hooks/useOpenTask';
import { formatDeadline, isOverdue, priorityMeta } from '@/features/tasks/utils/taskUtils';
import {
  busiestWeekday,
  fillMissingDays,
  shareOf,
  sumCompleted,
  useAnalyticsRange,
  useSpaceAnalytics,
} from '..';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { DistributeByTagsDialog } from '../components/DistributeByTagsDialog';
import { UpgradeCard } from '../components/UpgradeCard';
import { useDistributeTasksEqually } from '../hooks/useDistributeTasksEqually';
import { useDistributionUndo } from '../hooks/useDistributionUndo';
import type { AnalyticsRange } from '../types/analytics.types';

const RANGES: AnalyticsRange[] = ['7d', '30d', '90d'];

export const ActivityPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuth();
  const spaceQuery = useSpace(id);
  const canManageDistribution =
    user !== null &&
    user.plan === 'PRO' &&
    (spaceQuery.data?.ownerId ?? spaceQuery.data?.owner) === user._id;
  const publicSpace = usePublicSpace(id);
  const { range, setRange } = useAnalyticsRange();
  const analyticsQuery = useSpaceAnalytics(id, range);
  const distributeTasks = useDistributeTasksEqually(id, range);
  const [isDistributeByTagsOpen, setIsDistributeByTagsOpen] = useState(false);
  const distributionUndo = useDistributionUndo(id, range, canManageDistribution);
  const tasksQuery = useSpaceTasks(id);
  const { open } = useOpenTask();
  useSpaceTheme(spaceQuery.data);

  if (spaceQuery.isLoading) return <Skeleton className="h-[40rem]" />;
  if (spaceQuery.error instanceof ApiError && spaceQuery.error.isForbidden) {
    if (publicSpace.isLoading) return <Skeleton className="h-72" />;
    return publicSpace.data ? (
      <NotMemberScreen space={publicSpace.data} />
    ) : (
      <ErrorState message="Unable to load this space." onRetry={() => void publicSpace.refetch()} />
    );
  }
  if (spaceQuery.error instanceof ApiError && spaceQuery.error.isNotFound)
    return <EmptyState title="Space not found" />;
  if (spaceQuery.isError || !spaceQuery.data)
    return (
      <ErrorState message="Unable to load this space." onRetry={() => void spaceQuery.refetch()} />
    );

  const currentSpace = spaceQuery.data;
  const ownerCanUpgrade = canManageDistribution;
  const currentPath = `${ROUTES.spaceActivity(id)}?range=${range}`;
  const locked =
    analyticsQuery.isLocked ||
    (!analyticsQuery.data && user?.plan === 'FREE' && !analyticsQuery.isError);
  const hasData = analyticsQuery.data && analyticsQuery.state === 'ready';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description={`${currentSpace.name} performance report`}
        badge={<Badge variant="accent">Pro</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to={ROUTES.space(id)} className="text-sm text-text-muted hover:text-text">
              ← Back to space
            </Link>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportCsv(currentSpace.name, range, analyticsQuery.data)}
            >
              Export CSV
            </Button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Analytics range"
          className="inline-flex rounded-full border border-border p-1"
        >
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={range === item}
              onClick={() => setRange(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${range === item ? 'bg-accent text-text-inverse' : 'text-text-muted hover:bg-surface-hover'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {locked ? (
        <LockedPreview ownerCanUpgrade={ownerCanUpgrade} from={currentPath} />
      ) : analyticsQuery.isError ? (
        <ErrorState
          message="We could not load activity for this range."
          onRetry={() => void analyticsQuery.refetch()}
        />
      ) : analyticsQuery.isEmpty ? (
        <EmptyState
          title="No activity yet"
          description="Complete tasks to see performance insights for this space."
        />
      ) : hasData ? (
        <ActivityContent
          analytics={analyticsQuery.data}
          tasks={tasksQuery.data ?? []}
          onOpenTask={open}
          onDistribute={() =>
            distributeTasks.mutate(undefined, {
              onSuccess: ({ updatedCount }) => {
                toast.success(
                  updatedCount > 0
                    ? `${updatedCount} task${updatedCount === 1 ? '' : 's'} distributed equally`
                    : 'No active tasks to distribute',
                );
              },
              onError: (error) =>
                toast.error(
                  error instanceof Error ? error.message : 'Unable to distribute tasks equally',
                ),
            })
          }
          isDistributing={distributeTasks.isPending}
          onDistributeByTags={() => setIsDistributeByTagsOpen(true)}
          canDistribute={user?.plan === 'PRO' && ownerCanUpgrade}
          distributeDisabledReason={
            user?.plan !== 'PRO'
              ? 'Available with Pro'
              : !ownerCanUpgrade
                ? 'Only the space owner can distribute tasks'
                : undefined
          }
          onUndo={() =>
            distributionUndo.undoMutation.mutate(undefined, {
              onSuccess: ({ restoredCount }) => {
                toast.success(
                  restoredCount > 0
                    ? `${restoredCount} task${restoredCount === 1 ? '' : 's'} restored`
                    : 'No tasks needed restoring',
                );
              },
              onError: (error) =>
                toast.error(
                  error instanceof Error ? error.message : 'Unable to restore task distribution',
                ),
            })
          }
          isUndoing={distributionUndo.undoMutation.isPending}
          canUndo={distributionUndo.data?.canUndo ?? false}
        />
      ) : (
        <Skeleton className="h-[30rem]" />
      )}
      <DistributeByTagsDialog
        isOpen={isDistributeByTagsOpen}
        onClose={() => setIsDistributeByTagsOpen(false)}
        spaceId={id}
        spaceName={currentSpace.name}
      />
    </div>
  );
};

function LockedPreview({ ownerCanUpgrade, from }: { ownerCanUpgrade: boolean; from: string }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-border">
      <div aria-hidden="true" className="pointer-events-none select-none blur-sm">
        <div className="grid gap-4 p-5 sm:grid-cols-4">
          {['Tasks completed', 'On-time rate', 'Overdue now', 'Active workload'].map((item) => (
            <div key={item} className="h-28 rounded-card bg-surface p-4">
              <p className="text-xs text-text-muted">{item}</p>
              <p className="mt-4 text-2xl font-bold text-text">24</p>
            </div>
          ))}
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-2">
          <div className="h-64 rounded-card bg-surface" />
          <div className="h-64 rounded-card bg-surface" />
        </div>
      </div>
      <div className="bg-bg/70 absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
        <Badge variant="warning">Sample data</Badge>
        <UpgradeCard ownerCanUpgrade={ownerCanUpgrade} from={from} />
      </div>
    </div>
  );
}

function ActivityContent({
  analytics,
  tasks,
  onOpenTask,
  onDistribute,
  onDistributeByTags,
  isDistributing,
  canDistribute,
  distributeDisabledReason,
  onUndo,
  isUndoing,
  canUndo,
}: {
  analytics: NonNullable<ReturnType<typeof useSpaceAnalytics>['data']>;
  tasks: ReturnType<typeof useSpaceTasks>['data'];
  onOpenTask: (id: string) => void;
  onDistribute: () => void;
  onDistributeByTags?: () => void;
  isDistributing: boolean;
  canDistribute: boolean;
  distributeDisabledReason?: string;
  onUndo: () => void;
  isUndoing: boolean;
  canUndo: boolean;
}) {
  const completed = sumCompleted(analytics.tasksCompletedPerDay);
  const active = analytics.workloadPerMember.reduce(
    (sum, member) => sum + member.activeTasksCount,
    0,
  );
  const overdue =
    tasks
      ?.filter((task) => task.lifecycleStatus === 'ACTIVE' && isOverdue(task))
      .sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
      .slice(0, 10) ?? [];
  const insights = buildInsights(analytics);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Tasks completed" value={completed} />
        <Kpi
          label="On-time rate"
          value={analytics.onTimeRate === null ? '—' : `${analytics.onTimeRate}%`}
        />
        <Kpi
          label="Overdue now"
          value={analytics.overdueCount}
          danger={analytics.overdueCount > 0}
        />
        <Kpi label="Active workload" value={active} />
      </div>
      <AnalyticsCharts
        analytics={analytics}
        range={analytics.range}
        onDistribute={onDistribute}
        onDistributeByTags={onDistributeByTags}
        isDistributing={isDistributing}
        canDistribute={canDistribute}
        distributeDisabledReason={distributeDisabledReason}
        onUndo={onUndo}
        isUndoing={isUndoing}
        canUndo={canUndo}
      />
      {insights.length > 0 && (
        <section className="border-accent/30 bg-accent-muted/30 rounded-card border p-5">
          <h2 className="font-heading font-bold text-text">Insights</h2>
          <ul className="mt-2 space-y-1 text-sm text-text-muted">
            {insights.map((insight) => (
              <li key={insight}>• {insight}</li>
            ))}
          </ul>
        </section>
      )}
      <section className="rounded-card border border-border bg-surface p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-bold text-text">Overdue tasks</h2>
            <p className="text-xs text-text-muted">
              Live task data; KPI numbers cover the selected range.
            </p>
          </div>
          <Link
            to="?view=list&status=TODO,IN_PROGRESS"
            className="text-xs font-medium text-accent hover:underline"
          >
            View all in List view
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {overdue.length === 0 ? (
            <p className="text-sm text-text-muted">No overdue tasks.</p>
          ) : (
            overdue.map((task) => (
              <button
                key={task._id}
                type="button"
                onClick={() => onOpenTask(task._id)}
                className="flex w-full items-center gap-3 rounded-button border border-border p-3 text-left hover:bg-surface-hover"
              >
                <Badge variant={priorityMeta[task.priority].badgeVariant} size="sm">
                  {priorityMeta[task.priority].label}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                  {task.title}
                </span>
                <span className="shrink-0 text-xs text-error">{formatDeadline(task.deadline)}</span>
              </button>
            ))
          )}
        </div>
      </section>
    </>
  );
}

function Kpi({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string | number;
  danger?: boolean;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${danger ? 'text-error' : 'text-text'}`}>{value}</p>
    </section>
  );
}

function buildInsights(
  analytics: NonNullable<ReturnType<typeof useSpaceAnalytics>['data']>,
): string[] {
  const points = fillMissingDays(
    analytics.tasksCompletedPerDay,
    analytics.startDate,
    analytics.endDate,
  );
  const total = sumCompleted(points);
  const insights: string[] = [];
  const weekday = busiestWeekday(points);
  if (total >= 3 && weekday) insights.push(`Most work gets finished on ${weekday}.`);
  const shares = shareOf(analytics.completionByMember);
  const top = shares.sort((a, b) => b.completedCount - a.completedCount)[0];
  if (total >= 3 && top && top.completedCount > 0)
    insights.push(`${top.name} completed ${top.percentage}% of finished tasks.`);
  const workload = [...analytics.workloadPerMember].sort(
    (a, b) => b.activeTasksCount - a.activeTasksCount,
  );
  const active = workload.reduce((sum, member) => sum + member.activeTasksCount, 0);
  if (active >= 3 && workload[0] && workload[0].activeTasksCount / active > 0.5)
    insights.push(
      `${workload[0].name} holds ${Math.round((workload[0].activeTasksCount / active) * 100)}% of active tasks: consider rebalancing.`,
    );
  if (total >= 3 && analytics.onTimeRate !== null)
    insights.push(`On-time rate is ${analytics.onTimeRate}%.`);
  return insights.slice(0, 4);
}

function csvCell(value: string | number): string {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

function exportCsv(
  spaceName: string,
  range: AnalyticsRange,
  analytics: NonNullable<ReturnType<typeof useSpaceAnalytics>['data']> | undefined,
) {
  if (!analytics) {
    toast.info('Activity data is not ready yet');
    return;
  }
  const rows = [
    ['Tasks completed per day', ''],
    ['Date', 'Count'],
    ...analytics.tasksCompletedPerDay.map((point) => [point.date, point.count]),
    ['', ''],
    ['Completion by member', ''],
    ['Member', 'Completed'],
    ...analytics.completionByMember.map((member) => [member.name, member.completedCount]),
    ['', ''],
    ['Workload', ''],
    ['Member', 'Active tasks'],
    ...analytics.workloadPerMember.map((member) => [member.name, member.activeTasksCount]),
  ];
  const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `syncspace-${spaceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
