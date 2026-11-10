import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { approveMember, rejectMember } from '../api/pending-member.api';

export interface PendingMemberVariables {
  spaceId: string;
  userId: string;
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, spaceId: string) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.members.bySpace(spaceId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.byId(spaceId) });
  void queryClient.invalidateQueries({ queryKey: queryKeys.spaces.list() });
}

export function useApproveMember(): UseMutationResult<void, Error, PendingMemberVariables> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, userId }) => approveMember(spaceId, userId),
    onSuccess: (_data, { spaceId }) => invalidate(queryClient, spaceId),
  });
}

export function useRejectMember(): UseMutationResult<void, Error, PendingMemberVariables> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ spaceId, userId }) => rejectMember(spaceId, userId),
    onSuccess: (_data, { spaceId }) => invalidate(queryClient, spaceId),
  });
}
