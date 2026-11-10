/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';
import { validateRelativeUrl } from '../features/push/utils/pushUtils';
import type { PushNotificationPayload } from './pwa.types';

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ revision: string | null; url: string }>;
};

// 1. Precache build assets and clean outdated caches
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Immediately take control of clients
self.skipWaiting();
clientsClaim();

// 2. NEVER cache API responses or socket traffic (NetworkOnly) - never cache authenticated data
registerRoute(
  ({ url }) => url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io'),
  new NetworkOnly(),
);

// 3. SPA navigation fallback to index.html with denylist for /api and /socket.io
const navigationHandler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [/^\/api\//, /^\/socket\.io\//],
});
registerRoute(navigationRoute);

// 4. Skip waiting on message as well
self.addEventListener('message', (event) => {
  const data =
    typeof event.data === 'object' && event.data !== null
      ? (event.data as Record<string, unknown>)
      : null;
  if (data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

// 5. Push event handling
self.addEventListener('push', (event) => {
  let payload: PushNotificationPayload = {};
  if (event.data) {
    try {
      payload = event.data.json() as PushNotificationPayload;
    } catch {
      payload = { body: event.data.text() };
    }
  }

  const title = payload.title || 'SyncSpace';
  const body = payload.body || 'You have a new notification';
  const icon = payload.icon || '/icons/pwa-192x192.png';
  const badge = payload.badge || '/icons/badge-96.png';
  const tag = payload.tag || 'syncspace-notification';
  const renotify = payload.renotify ?? true;
  const data = payload.data || {};
  const timestamp = payload.timestamp || Date.now();

  // Try updating app badge if unreadCount was sent
  if (typeof data.unreadCount === 'number') {
    try {
      const nav = self.navigator as unknown as {
        setAppBadge?: (count: number) => Promise<void>;
      };
      if (typeof nav.setAppBadge === 'function') {
        void nav.setAppBadge(data.unreadCount).catch(() => {});
      }
    } catch {
      // Guarded against environments without badge API
    }
  }

  // ALWAYS call showNotification (critical for iOS Safari permission preservation)
  const options = {
    body,
    icon,
    badge,
    tag,
    data,
    ...(renotify ? { renotify } : {}),
    ...(timestamp ? { timestamp } : {}),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 6. Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = (event.notification.data || {}) as {
    url?: string;
    notificationId?: string;
  };
  const rawUrl = data.url;
  const notificationId = data.notificationId;
  const safeUrl = validateRelativeUrl(rawUrl, '/notifications');

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // If an existing window client is found, focus it and post NAVIGATE message
      for (const client of clientList) {
        if ('focus' in client && 'postMessage' in client) {
          await client.focus();
          client.postMessage({
            type: 'NAVIGATE',
            url: safeUrl,
            notificationId,
          });
          return;
        }
      }

      // Otherwise open a new window with ?notif= param for startup read handler
      const joinChar = safeUrl.includes('?') ? '&' : '?';
      const finalUrl = notificationId
        ? `${safeUrl}${joinChar}notif=${encodeURIComponent(notificationId)}`
        : safeUrl;

      await self.clients.openWindow(finalUrl);
    })(),
  );
});

interface PushSubscriptionChangeEvent extends ExtendableEvent {
  oldSubscription?: PushSubscription | null;
  newSubscription?: PushSubscription | null;
}

// 7. Push subscription change handling
self.addEventListener('pushsubscriptionchange', (event: Event) => {
  const changeEvent = event as PushSubscriptionChangeEvent;
  changeEvent.waitUntil(
    (async () => {
      try {
        const applicationServerKey = changeEvent.oldSubscription?.options.applicationServerKey;
        const newSubscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey || undefined,
        });

        // Notify open window clients so app re-syncs with backend
        const clientList = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
        for (const client of clientList) {
          client.postMessage({
            type: 'PUSH_SUBSCRIPTION_CHANGED',
            subscription: newSubscription.toJSON(),
          });
        }
      } catch (err) {
        console.warn('[SW] pushsubscriptionchange failed:', err);
      }
    })(),
  );
});
