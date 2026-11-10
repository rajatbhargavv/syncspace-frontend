import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

/**
 * Registers the Service Worker and sets up update prompts.
 * Prompts user with a sonner toast when a new version is waiting to activate.
 */
export function registerAppServiceWorker(): () => void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  // Reload page only when a previous service worker is replaced by a newer version
  const hadController = Boolean(navigator.serviceWorker.controller);
  let isRefreshing = false;
  const onControllerChange = () => {
    if (!hadController || isRefreshing) return;
    isRefreshing = true;
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        toast('A new version is available', {
          duration: Infinity,
          action: {
            label: 'Reload',
            onClick: () => {
              void updateSW(true);
            },
          },
        });
      },
      onOfflineReady() {
        // App shell is precached and ready for offline use
      },
      onRegisterError(error) {
        console.warn('[PWA] Service worker registration error:', error);
      },
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  } catch (error) {
    console.warn('[PWA] Failed to initialize service worker registration:', error);
    return () => {};
  }
}
