import React, { useMemo, useState } from 'react';
import { NotchCard } from '@/components/ui/NotchCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSpaceMembers } from '@/features/members';
import { DistributeByTagsDialog } from '@/features/analytics';
import { useSpaceTasks } from '../hooks/useSpaceTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { computeWorkload } from '../utils/taskUtils';

export interface WorkloadStripProps {
  spaceId: string;
}

export const WorkloadStrip: React.FC<WorkloadStripProps> = ({ spaceId }) => {
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);
  const membersQuery = useSpaceMembers(spaceId);
  const tasksQuery = useSpaceTasks(spaceId);
  const { filters, setFilters } = useTaskFilters();
  const members = membersQuery.data?.filter((member) => member.status === 'ACTIVE') ?? [];
  const tasks = tasksQuery.data ?? [];

  const selectedAssigneeIds = useMemo(() => {
    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      return new Set(filters.assigneeIds);
    }
    if (filters.assigneeId) {
      return new Set([filters.assigneeId]);
    }
    return new Set<string>();
  }, [filters.assigneeIds, filters.assigneeId]);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-text">My workload</h2>
          <p className="text-xs text-text-muted">
            See how tasks are distributed across active members. Click cards to filter by one or
            more members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedAssigneeIds.size > 0 && (
            <button
              type="button"
              onClick={() => setFilters({ assigneeId: undefined, assigneeIds: undefined })}
              className="text-xs font-medium text-accent hover:underline"
            >
              Clear filter ({selectedAssigneeIds.size})
            </button>
          )}
          {members.length > 1 && (
            <button
              type="button"
              onClick={() => setIsDistributeOpen(true)}
              className="rounded-button border border-accent/40 bg-accent/5 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/15 transition-colors"
              title="Distribute tasks to members based on tags (PRO)"
            >
              🏷️ Distribute by tags
            </button>
          )}
        </div>
      </div>
      {members.length === 0 ? (
        <p className="rounded-card border border-dashed border-border p-4 text-sm text-text-muted">
          No active members yet.
        </p>
      ) : (
        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {members.map((member) => {
            const memberUserId = member.userId._id;
            const workload = computeWorkload(tasks, memberUserId);
            const isSelected = selectedAssigneeIds.has(memberUserId);
            return (
              <NotchCard
                key={memberUserId}
                variant="member"
                name={member.userId.name}
                memberRole={member.role === 'OWNER' ? 'Owner' : 'Member'}
                footerLeftLabel={`${workload.activeTasksCount} active tasks`}
                score={workload.score}
                scoreLabel={`${workload.score}/5`}
                onClick={() => {
                  setFilters((current) => {
                    const currentIds =
                      current.assigneeIds && current.assigneeIds.length > 0
                        ? current.assigneeIds
                        : current.assigneeId
                          ? [current.assigneeId]
                          : [];

                    const nextIds = isSelected
                      ? currentIds.filter((id) => id !== memberUserId)
                      : [...currentIds, memberUserId];

                    return {
                      ...current,
                      assigneeIds: nextIds.length > 0 ? nextIds : undefined,
                      assigneeId: nextIds.length > 0 ? nextIds[0] : undefined,
                    };
                  });
                }}
                className={`min-w-64 cursor-pointer snap-start transition-all ${
                  isSelected ? 'border-accent ring-2 ring-accent' : ''
                }`}
              />
            );
          })}
        </div>
      )}
      <DistributeByTagsDialog
        isOpen={isDistributeOpen}
        onClose={() => setIsDistributeOpen(false)}
        spaceId={spaceId}
      />
    </section>
  );
};
