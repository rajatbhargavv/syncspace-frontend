import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { socketActions } from '@/lib/socket';
import { joinSpace, leaveSpace, removeMember } from '../api/member.api';
import type { SpaceMember } from '../types/member.types';

function invalidateSpaceQueries(queryClient: ReturnType<typeof useQueryClient>, spaceId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.members.bySpace(spaceId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.byId(spaceId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.list() });
}

export function useJoinSpace(): UseMutationResult<SpaceMember | undefined, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinSpace,
    onSuccess: (_data, spaceId) => {
      invalidateSpaceQueries(queryClient, spaceId);
      socketActions.joinSpace(spaceId);
    },
  });
}

export function useLeaveSpace(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveSpace,
    onSuccess: (_data, spaceId) => {
      invalidateSpaceQueries(queryClient, spaceId);
      socketActions.leaveSpace(spaceId);
    },
  });
}

export interface RemoveMemberVariables {
  spaceId: string;
  userId: string;
}

export function useRemoveMember(): UseMutationResult<void, Error, RemoveMemberVariables> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, userId }) => removeMember(spaceId, userId),
    onSuccess: (_data, { spaceId }) => invalidateSpaceQueries(queryClient, spaceId),
  });
}
