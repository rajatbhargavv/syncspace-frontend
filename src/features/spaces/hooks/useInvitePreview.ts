import { useQuery } from '@tanstack/react-query';
import { getInvitePreview } from '../api/space.api';

export function useInvitePreview(token: string) {
  return useQuery({
    queryKey: ['space-invite-preview', token],
    queryFn: () => getInvitePreview(token),
    enabled: Boolean(token),
  });
}
