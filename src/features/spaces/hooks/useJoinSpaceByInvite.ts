import { useMutation } from '@tanstack/react-query';
import { joinSpaceByInvite } from '../api/space.api';

export function useJoinSpaceByInvite() {
  return useMutation({
    mutationFn: (token: string) => joinSpaceByInvite(token),
  });
}
