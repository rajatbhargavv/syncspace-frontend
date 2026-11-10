import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarkNotificationRead } from '@/features/notifications';
import { validateRelativeUrl } from '../utils/pushUtils';

/**
 * Handles incoming Service Worker messages (e.g. NAVIGATE on notification click)
 * and deep-link ?notif=<id> parameters on startup.
 */
export function useServiceWorkerMessages(): void {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();

  // 1. Handle startup ?notif=<id> query parameter and strip it cleanly
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const notifId = params.get('notif');
      if (notifId) {
        markRead.mutate(notifId);
        params.delete('notif');
        const qs = params.toString() ? `?${params.toString()}` : '';
        const cleanUrl = `${window.location.pathname}${qs}${window.location.hash}`;
        window.history.replaceState(null, '', cleanUrl);
      }
    } catch {
      // Ignored
    }
  }, [markRead]);

  // 2. Listen to NAVIGATE message from Service Worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const data =
        typeof event.data === 'object' && event.data !== null
          ? (event.data as Record<string, unknown>)
          : null;

      if (data?.type === 'NAVIGATE' && typeof data.url === 'string') {
        const safeUrl = validateRelativeUrl(data.url, '/notifications');
        if (typeof data.notificationId === 'string') {
          markRead.mutate(data.notificationId);
        }
        navigate(safeUrl);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [navigate, markRead]);
}
