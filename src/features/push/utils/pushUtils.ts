/**
 * Validates that a destination URL is a safe, same-origin relative path.
 * Disallows protocol-relative URLs (//evil.com), javascript:, data:, or absolute URLs.
 */
export function validateRelativeUrl(url?: unknown, fallback = '/notifications'): string {
  if (typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed || !trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  try {
    const dummyOrigin = 'https://syncspace.internal';
    const parsed = new URL(trimmed, dummyOrigin);

    // Ensure origin didn't change (prevents protocol-relative escapes)
    if (parsed.origin !== dummyOrigin) {
      return fallback;
    }

    // Return the relative path with search params and hash
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Converts a base64 URL-safe VAPID public key into a Uint8Array
 * required by pushManager.subscribe({ applicationServerKey }).
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  let rawData: string;
  if (typeof atob === 'function') {
    rawData = atob(base64);
  } else if (typeof Buffer !== 'undefined') {
    rawData = Buffer.from(base64, 'base64').toString('binary');
  } else {
    throw new Error('Base64 decoder unavailable');
  }

  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks whether the current browser environment supports Push Notifications.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Checks whether the application is currently running in standalone display mode (installed PWA).
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isMediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isNavigatorStandalone =
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return isMediaStandalone || isNavigatorStandalone;
}

/**
 * Detects iOS device (iPhone, iPad, iPod, or iPadOS on MacIntel).
 */
export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}

/**
 * Returns current Notification permission state or 'unsupported' if Push is unavailable.
 */
export function getPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}
