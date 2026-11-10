import React from 'react';
import { NotchCard } from '@/components/ui/NotchCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSpaceMembers } from '@/features/members';
import { useSpaceTasks } from '../hooks/useSpaceTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { computeWorkload } from '../utils/taskUtils';

export interface WorkloadStripProps {
  spaceId: string;
}

export const WorkloadStrip: React.FC<WorkloadStripProps> = ({ spaceId }) => {
  const membersQuery = useSpaceMembers(spaceId);
  const tasksQuery = useSpaceTasks(spaceId);
  const { filters, setFilters } = useTaskFilters();
  const members = membersQuery.data?.filter((member) => member.status === 'ACTIVE') ?? [];
  const tasks = tasksQuery.data ?? [];

  if (membersQuery.isLoading) {
    return (
      <section aria-label="My workload" className="flex gap-3 overflow-hidden">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-28 min-w-56" />
        ))}
      </section>
    );
  }

  return (
    <section data-testid="workload-strip" aria-label="My workload" className="space-y-3">
      <div>
        <h2 className="font-heading text-lg font-bold text-text">My workload</h2>
        <p className="text-xs text-text-muted">
          See how tasks are distributed across active members.
        </p>
      </div>
      {members.length === 0 ? (
        <p className="rounded-card border border-dashed border-border p-4 text-sm text-text-muted">
          No active members yet.
        </p>
      ) : (
        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {members.map((member) => {
            const workload = computeWorkload(tasks, member.userId._id);
            const selected = filters.assigneeId === member.userId._id;
            return (
              <NotchCard
                key={member.userId._id}
                variant="member"
                name={member.userId.name}
                memberRole={member.role === 'OWNER' ? 'Owner' : 'Member'}
                footerLeftLabel={`${workload.activeTasksCount} active tasks`}
                score={workload.score}
                scoreLabel={`${workload.score}/5`}
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    assigneeId: selected ? undefined : member.userId._id,
                  }))
                }
                className={`min-w-64 snap-start ${selected ? 'border-accent ring-1 ring-accent' : ''}`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
