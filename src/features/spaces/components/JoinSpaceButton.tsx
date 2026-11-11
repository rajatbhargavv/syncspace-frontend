import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '@/types';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useJoinSpace } from '@/features/members';
import type { SpaceJoinPolicy } from '../types/space.types';

export interface JoinSpaceButtonProps {
  spaceId: string;
  joinPolicy: SpaceJoinPolicy;
  isMember?: boolean;
}

export const JoinSpaceButton: React.FC<JoinSpaceButtonProps> = ({
  spaceId,
  joinPolicy,
  isMember = false,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const join = useJoinSpace();
  const [requestSent, setRequestSent] = useState(false);

  if (isMember) {
    return (
      <Button variant="outline" onClick={() => navigate(ROUTES.SPACE(spaceId))}>
        Open space
      </Button>
    );
  }

  if (joinPolicy === 'INVITE_ONLY') {
    return (
      <Button variant="outline" disabled>
        This space is invite only
      </Button>
    );
  }

  if (requestSent) {
    return <p className="text-sm font-medium text-success">Request sent, waiting for approval</p>;
  }

  const label = joinPolicy === 'REQUEST' ? 'Request to join' : 'Join space';
  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }

    try {
      await join.mutateAsync(spaceId);
      if (joinPolicy === 'REQUEST') {
        setRequestSent(true);
      } else {
        toast.success('You joined the space');
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.spaces.public(spaceId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.spaces.list() });
        toast.info('You are already a member of this space');
        return;
      }
      toast.error(error instanceof Error ? error.message : 'Unable to join this space');
    }
  };

  return (
    <Button onClick={() => void handleJoin()} isLoading={join.isPending}>
      {label}
    </Button>
  );
};
