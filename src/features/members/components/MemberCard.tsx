import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, Badge, NotchCard } from '@/components/ui';
import { formatDate } from '@/lib/date';
import { ROUTES } from '@/config/routes';
import type { SpaceMember } from '../types/member.types';

export interface MemberCardProps {
  member: SpaceMember;
  onRemove?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onRemove }) => {
  return (
    <NotchCard variant="custom" className="min-h-0 p-4" onArrowClick={onRemove}>
      <div className="flex items-center gap-3 pr-9">
        <Avatar name={member.userId.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={ROUTES.profile(member.userId._id)}
              className="truncate text-sm font-semibold text-text hover:text-accent"
            >
              {member.userId.name}
            </Link>
            <Badge variant={member.role === 'OWNER' ? 'accent' : 'default'} size="sm">
              {member.role === 'OWNER' ? 'Owner' : 'Member'}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-text-muted">Joined {formatDate(member.joinedAt)}</p>
        </div>
        {onRemove && (
          <button
            type="button"
            className="absolute bottom-3 right-4 text-xs font-medium text-error hover:underline"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
          >
            Remove
          </button>
        )}
      </div>
    </NotchCard>
  );
};
