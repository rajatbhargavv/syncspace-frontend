import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { disconnectSocket } from '@/lib/socket';
import { queryKeys } from '@/lib/queryKeys';
import { unsubscribe } from '@/features/push';
import { logout } from '../api/auth.api';

export function useLogout(): UseMutationResult<{ message: string }, Error, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 1. Unsubscribe push for this device before logout
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const getRegPromise = (async () => {
            if (typeof navigator.serviceWorker.getRegistration === 'function') {
              const reg = await navigator.serviceWorker.getRegistration();
              if (reg) return reg;
            }
            return await navigator.serviceWorker.ready;
          })();

          const reg = await Promise.race([
            getRegPromise,
            new Promise<undefined>((resolve) => setTimeout(resolve, 300)),
          ]);

          const sub = await reg?.pushManager.getSubscription();
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

      // 3. Clear auth session on backend (never block client logout on network error)
      let response = { message: 'Logged out' };
      try {
        response = await logout();
      } catch (err) {
        console.warn('Backend logout failed:', err);
      }

      disconnectSocket();
      queryClient.setQueryData(queryKeys.auth.me(), null);
      queryClient.clear();
      queryClient.setQueryData(queryKeys.auth.me(), null);

      return response;
    },
  });
}
