import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/app/providers/useAuth';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useSpace } from '@/features/spaces';
import { useSpaceMembers } from '@/features/members';
import { useTask } from '@/features/tasks';
import { useCreateComment } from '../hooks/useCreateComment';
import { useTimeline } from '../hooks/useTimeline';
import { groupTimelineItems } from '../utils/timelineUtils';
import { EventTimelineItem } from './EventTimelineItem';
import { CommentCard } from './CommentCard';
import { CommentComposer } from './CommentComposer';

export interface DiscussionTimelineProps {
  taskId: string;
  spaceId: string;
}

export const DiscussionTimeline: React.FC<DiscussionTimelineProps> = ({ taskId, spaceId }) => {
  const { user } = useAuth();
  const timelineQuery = useTimeline(taskId);
  const createComment = useCreateComment();
  const spaceQuery = useSpace(spaceId);
  const taskQuery = useTask(taskId);
  const membersQuery = useSpaceMembers(spaceId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const prevItemsLengthRef = useRef(0);

  const space = spaceQuery.data;
  const task = taskQuery.data;
  const items = useMemo(() => timelineQuery.data ?? [], [timelineQuery.data]);
  const isInactive = space?.status === 'Inactive';
  const isDeleted = task?.lifecycleStatus === 'DELETED';
  const isReadOnly = isInactive || isDeleted;

  const activeMembers = useMemo(
    () =>
      (membersQuery.data ?? [])
        .filter((m) => m.status === 'ACTIVE')
        .map((m) => ({ _id: m.userId._id, name: m.userId.name })),
    [membersQuery.data],
  );

  const memberNames = useMemo(() => activeMembers.map((m) => m.name), [activeMembers]);
  const memberLookup = useMemo(() => {
    const map = new Map(activeMembers.map((m) => [m._id, m.name]));
    return (id: string) => map.get(id);
  }, [activeMembers]);

  // Handle scroll position and "New activity" floating indicator
  const scrollToBottom = (smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setHasNewActivity(false);
    }
  };

  useEffect(() => {
    if (items.length > prevItemsLengthRef.current && prevItemsLengthRef.current > 0) {
      const el = containerRef.current;
      if (el) {
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        if (isNearBottom) {
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          scrollToBottom(!prefersReduced);
        } else {
          setHasNewActivity(true);
        }
      }
    }
    prevItemsLengthRef.current = items.length;
  }, [items.length]);

  const groups = useMemo(() => groupTimelineItems(items), [items]);

  if (timelineQuery.isLoading) {
    return (
      <div className="space-y-4 py-2" data-testid="discussion-loading">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (timelineQuery.isError) {
    return (
      <ErrorState
        message={timelineQuery.error.message || 'Failed to load discussion timeline.'}
        onRetry={() => void timelineQuery.refetch()}
      />
    );
  }

  return (
    <div className="relative flex flex-col space-y-4">
      {/* Scrollable Timeline */}
      <div
        ref={containerRef}
        className="relative max-h-[480px] overflow-y-auto pr-1"
        aria-label="Discussion timeline"
      >
        {/* Continuous Left Line */}
        <div
          aria-hidden="true"
          className="absolute bottom-4 left-4 top-4 w-0.5 bg-border pointer-events-none"
        />

        {items.length === 0 ? (
          <div className="py-6">
            <EmptyState
              title="No discussion yet"
              description="Start the conversation by posting the first comment or mention a teammate."
            />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {groups.map((group, groupIdx) => {
              if (group.type === 'comment') {
                return (
                  <CommentCard
                    key={group.item._id}
                    comment={group.item}
                    currentUserId={user?._id}
                    isSpaceOwner={space?.owner === group.item.author?._id}
                    isTaskCreator={task?.createdBy === group.item.author?._id}
                    activeMemberNames={memberNames}
                    disabled={isReadOnly}
                  />
                );
              }
              return (
                <div key={`events-${groupIdx}`} className="space-y-1">
                  {group.items.map((event) => (
                    <EventTimelineItem
                      key={event._id}
                      event={event}
                      spaceKind={space?.kind}
                      memberLookup={memberLookup}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating "New activity" button */}
      {hasNewActivity && (
        <div className="sticky bottom-24 flex justify-center">
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-text-inverse shadow-elevated transition-transform hover:scale-105"
          >
            <span>↓</span> New activity
          </button>
        </div>
      )}

      {/* Composer or Read-Only Banner */}
      <div className="pt-2">
        <CommentComposer
          taskId={taskId}
          members={activeMembers}
          disabled={isReadOnly}
          disabledReason={
            isInactive
              ? 'This space is inactive and read-only.'
              : isDeleted
                ? 'This task has been deleted.'
                : undefined
          }
          isPending={createComment.isPending}
          onSubmit={async (content, onErrorDraft) => {
            await createComment.mutateAsync({ taskId, content, onErrorDraft });
            scrollToBottom(true);
          }}
        />
      </div>
    </div>
  );
};
