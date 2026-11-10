import React from 'react';
import { toast } from 'sonner';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { ApiError } from '@/lib/http/ApiError';
import { useApproveMember, useRejectMember } from '../hooks/usePendingMemberMutations';
import { usePendingMembers as usePendingMembersQuery } from '../hooks/usePendingMembers';
import { PendingRequestItem } from './PendingRequestItem';

export interface PendingRequestsProps {
  spaceId: string;
}

export const PendingRequests: React.FC<PendingRequestsProps> = ({ spaceId }) => {
  const pending = usePendingMembersQuery(spaceId);
  const approve = useApproveMember();
  const reject = useRejectMember();
  const unsupported =
    pending.error instanceof ApiError && (pending.error.isNotFound || pending.error.status === 400);

  if (unsupported) return null;
  if (pending.isLoading) return <Skeleton className="h-24" />;
  if (pending.isError)
    return (
      <ErrorState
        message="Unable to load pending requests."
        onRetry={() => void pending.refetch()}
      />
    );
  if (!pending.data?.length)
    return <EmptyState title="No pending requests" description="Join requests will appear here." />;

  const act = (type: 'approve' | 'reject', userId: string, name: string) => {
    if (!window.confirm(`${type === 'approve' ? 'Approve' : 'Reject'} ${name}'s request?`)) return;
    const mutation = type === 'approve' ? approve : reject;
    mutation.mutate(
      { spaceId, userId },
      {
        onSuccess: () =>
          toast.success(type === 'approve' ? 'Request approved' : 'Request rejected'),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Unable to update request'),
      },
    );
  };

  return (
    <section aria-labelledby="pending-requests-heading" className="space-y-3">
      <h2 id="pending-requests-heading" className="font-heading text-xl font-semibold text-text">
        Pending requests
      </h2>
      {pending.data.map((member) => (
        <PendingRequestItem
          key={member.userId._id}
          member={member}
          isBusy={approve.isPending || reject.isPending}
          onApprove={() => act('approve', member.userId._id, member.userId.name)}
          onReject={() => act('reject', member.userId._id, member.userId.name)}
        />
      ))}
    </section>
  );
};
