import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/useAuth';
import { getPublicKey, sendTest, subscribe, unsubscribe } from '../api/push.api';
import type { PushPermissionState, PushSubscriptionPayload } from '../types/push.types';
import {
  getPermissionState,
  isIos,
  isPushSupported,
  isStandalone,
  urlBase64ToUint8Array,
} from '../utils/pushUtils';

export interface UsePushNotificationsReturn {
  state: PushPermissionState;
  isSubscribed: boolean;
  isLoading: boolean;
  testCooldown: number;
  error: string | null;
  enable: () => Promise<boolean>;
  disable: () => Promise<boolean>;
  sendTest: () => Promise<void>;
  refetchState: () => Promise<void>;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Worker is not supported in this browser');
  }

  // 1. If an active registration already exists, return it immediately
  if (typeof navigator.serviceWorker.getRegistration === 'function') {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.active) return reg;
    } catch {
      // Fallback to ready
    }
  }

  // 2. Race ready with a 4s timeout so it NEVER hangs indefinitely
  const readyPromise = navigator.serviceWorker.ready;
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Service Worker is not ready yet')), 4000),
  );

  return await Promise.race([readyPromise, timeoutPromise]);
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<PushPermissionState>('default');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testCooldown, setTestCooldown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testCooldown <= 0) return;
    const interval = window.setInterval(() => {
      setTestCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [testCooldown]);

  const evaluateState = useCallback(async (): Promise<PushPermissionState> => {
    if (!isPushSupported()) {
      return 'unsupported';
    }

    if (isIos() && !isStandalone()) {
      return 'ios-needs-install';
    }

    const perm = getPermissionState();
    if (perm === 'unsupported') {
      return 'unsupported';
    }

    if (perm === 'denied') {
      return 'denied';
    }

    if (perm === 'default') {
      return 'default';
    }

    // Permission is granted; check active browser PushSubscription
    try {
      if (typeof navigator.serviceWorker.getRegistration === 'function') {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          return sub ? 'granted-subscribed' : 'granted-unsubscribed';
        }
      }
      const reg = await getRegistration();
      const sub = await reg.pushManager.getSubscription();
      return sub ? 'granted-subscribed' : 'granted-unsubscribed';
    } catch {
      return 'granted-unsubscribed';
    }
  }, []);

  const refetchState = useCallback(async () => {
    try {
      const nextState = await evaluateState();
      setState(nextState);
    } catch (err: unknown) {
      console.warn('[Push] Error evaluating state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [evaluateState]);

  useEffect(() => {
    void refetchState();
  }, [refetchState]);

  // Listen for permission changes (e.g. user toggled in browser site settings)
  // and re-evaluate on window focus so external changes update the UI immediately
  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;
    const handlePermissionChange = () => {
      void refetchState();
    };

    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        const descriptor = { name: 'notifications' } as unknown as PermissionDescriptor;
        navigator.permissions
          .query(descriptor)
          .then((status) => {
            permissionStatus = status;
            status.addEventListener('change', handlePermissionChange);
          })
          .catch(() => {});
      } catch {
        // Permissions API or 'notifications' name not supported in this browser
      }
    }

    const handleFocus = () => {
      void refetchState();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      permissionStatus?.removeEventListener('change', handlePermissionChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchState]);

  // Re-sync subscription with backend when user logs in or switches account
  useEffect(() => {
    if (!user || !isPushSupported()) return;

    void (async () => {
      try {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
        const reg = await getRegistration();
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          const json = sub.toJSON();
          if (json.endpoint && json.keys?.p256dh && json.keys.auth) {
            await subscribe({
              endpoint: json.endpoint,
              keys: {
                p256dh: json.keys.p256dh,
                auth: json.keys.auth,
              },
            });
          }
        }
      } catch (err) {
        console.warn('[Push] Auto-resync failed:', err);
      }
    })();
  }, [user]);

  // Listen to PUSH_SUBSCRIPTION_CHANGED from service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      const data =
        typeof event.data === 'object' && event.data !== null
          ? (event.data as Record<string, unknown>)
          : null;
      if (data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        void refetchState();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [refetchState]);

  // User-gesture-triggered enable
  const enable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isPushSupported()) {
        throw new Error('Push notifications are not supported on this browser');
      }

      if (isIos() && !isStandalone()) {
        throw new Error('On iOS, please add SyncSpace to your Home Screen first');
      }

      const permission = await Notification.requestPermission();
      if (permission === 'denied') {
        setState('denied');
        throw new Error('Notification permission was denied');
      }

      if (permission !== 'granted') {
        setState('default');
        return false;
      }

      const reg = await getRegistration();
      const publicKey = await getPublicKey();
      if (!publicKey) {
        throw new Error('Push configuration is missing on the server');
      }

      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscribePromise = reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'Push subscription timed out. In Brave, ensure "Use Google services for push messaging" is allowed in brave://settings/privacy.',
              ),
            ),
          12000,
        ),
      );

      const subscription = await Promise.race([subscribePromise, timeoutPromise]);

      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys.auth) {
        throw new Error('Failed to generate push subscription keys');
      }

      const payload: PushSubscriptionPayload = {
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
      };

      await subscribe(payload);
      setState('granted-subscribed');
      toast.success('Push notifications enabled for this device');
      return true;
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Failed to enable notifications';
      if (msg.toLowerCase().includes('push service error')) {
        msg =
          'Brave requires Google push services. Enable "Use Google services for push messaging" in brave://settings/privacy and relaunch Brave.';
      }
      setError(msg);
      toast.error(msg, { duration: 7000 });
      await refetchState();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refetchState]);

  // User-gesture-triggered disable
  const disable = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if ('serviceWorker' in navigator) {
        const reg = await getRegistration().catch(() => null);
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          try {
            await unsubscribe(sub.endpoint);
          } catch (apiErr) {
            console.warn('[Push] Server unsubscribe error (ignored):', apiErr);
          }
          await sub.unsubscribe();
        }
      }

      // Clear app badge if supported
      if ('clearAppBadge' in navigator) {
        void (navigator as unknown as { clearAppBadge?: () => Promise<void> })
          .clearAppBadge?.()
          .catch(() => {});
      }

      setState('granted-unsubscribed');
      toast.info('Push notifications disabled for this device');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disable notifications';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a test notification to verify delivery
  const handleSendTest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendTest();
      setTestCooldown(30);
      toast.success('Test notification sent! Check your device notifications.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send test notification';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    state,
    isSubscribed: state === 'granted-subscribed',
    isLoading,
    testCooldown,
    error,
    enable,
    disable,
    sendTest: handleSendTest,
    refetchState,
  };
}
