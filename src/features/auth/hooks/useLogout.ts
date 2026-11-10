import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { disconnectSocket } from '@/lib/socket';
import { unsubscribe } from '@/features/push';
import { logout } from '../api/auth.api';

export function useLogout(): UseMutationResult<{ message: string }, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 1. Unsubscribe push for this device before logout
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            try {
              await unsubscribe(sub.endpoint);
            } catch {
              // Ignore failure before logout
            }
            await sub.unsubscribe().catch(() => {});
          }
        } catch {
          // Ignore
        }
      }

      // 2. Clear app badge if supported
      if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
        try {
          void (navigator as unknown as { clearAppBadge?: () => Promise<void> })
            .clearAppBadge?.()
            .catch(() => {});
        } catch {
          // Ignore
        }
      }

      // 3. Complete logout request
      return await logout();
    },
    onSuccess: () => {
      disconnectSocket();
      queryClient.clear();
    },
  });
}
