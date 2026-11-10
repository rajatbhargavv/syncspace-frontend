// SyncSpace Push Notification Service Worker Script
// Handles push notifications, notification clicks, and subscription changes.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (_err) {
    payload = {
      title: 'SyncSpace Notification',
      body: event.data.text(),
      url: '/notifications',
    };
  }

  const title = payload.title || 'SyncSpace';
  const body = payload.body || '';
  const icon = payload.icon || '/pwa-192x192.png';
  const badge = '/pwa-64x64.png';
  const tag = payload.tag || (payload.notificationId ? `notification:${payload.notificationId}` : 'syncspace-notification');
  const url = payload.url || '/notifications';

  // Update app icon badge if supported
  if (typeof payload.unreadCount === 'number' && 'setAppBadge' in navigator) {
    navigator.setAppBadge(payload.unreadCount).catch(() => {});
  }

  const notificationOptions = {
    body,
    icon,
    badge,
    tag,
    data: {
      url,
      notificationId: payload.notificationId,
      type: payload.type,
      unreadCount: payload.unreadCount,
    },
  };

  event.waitUntil(self.registration.showNotification(title, notificationOptions));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a SyncSpace tab is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(fullTargetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(fullTargetUrl);
      }
    }),
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  // Push service has invalidated or refreshed the subscription
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription?.options || { userVisibleOnly: true })
      .then((newSubscription) => {
        return clients.matchAll({ type: 'window' }).then((clientList) => {
          clientList.forEach((client) => {
            client.postMessage({
              type: 'PUSH_SUBSCRIPTION_CHANGED',
              subscription: newSubscription.toJSON(),
            });
          });
        });
      })
      .catch(() => {}),
  );
});
