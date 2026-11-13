import { useMutation } from '@tanstack/react-query';
import { createSpaceInvite } from '../api/space.api';

export function useCreateSpaceInvite() {
  return useMutation({
    mutationFn: ({
      spaceId,
      options,
    }: {
      spaceId: string;
      options?: { expiresInHours?: number; maxUses?: number };
    }) => createSpaceInvite(spaceId, options),
  });
}
