import React from 'react';
import { Avatar, Button } from '@/components/ui';
import type { SpaceMember } from '../types/member.types';

export interface PendingRequestItemProps {
  member: SpaceMember;
  isBusy?: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export const PendingRequestItem: React.FC<PendingRequestItemProps> = ({
  member,
  isBusy,
  onApprove,
  onReject,
}) => (
  <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3">
      <Avatar name={member.userId.name} size="sm" />
      <div>
        <p className="text-sm font-semibold text-text">{member.userId.name}</p>
        <p className="text-xs text-text-muted">Requested to join</p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button size="sm" onClick={onApprove} isLoading={isBusy}>
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={onReject} disabled={isBusy}>
        Reject
      </Button>
    </div>
  </div>
);
