import { useCallback, useEffect, useState } from 'react';
import type { BeforeInstallPromptEvent } from '@/pwa/pwa.types';
import { isIos, isStandalone } from '../utils/pushUtils';

const SESSION_KEY = 'syncspace_session_count';
const BANNER_DISMISSED_KEY = 'syncspace_install_banner_dismissed';

export interface UseInstallPromptReturn {
  isInstallable: boolean;
  isStandalone: boolean;
  isIosDevice: boolean;
  isIOSDialogOpen: boolean;
  shouldShowBanner: boolean;
  promptInstall: () => Promise<boolean>;
  openIOSDialog: () => void;
  closeIOSDialog: () => void;
  dismissBanner: () => void;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandalone());
  const [isIOSDialogOpen, setIsIOSDialogOpen] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(true);

  // Initialize session count and banner status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone = isStandalone();
    setIsInstalled(standalone);
    if (standalone) return;

    try {
      const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
      setIsBannerDismissed(dismissed);

      // Increment session counter once per browser session
      const currentRaw = sessionStorage.getItem('syncspace_session_tracked');
      let count = Number.parseInt(localStorage.getItem(SESSION_KEY) || '0', 10);
      if (!currentRaw) {
        sessionStorage.setItem('syncspace_session_tracked', 'true');
        count += 1;
        localStorage.setItem(SESSION_KEY, count.toString());
      }
      setSessionCount(count);
    } catch {
      // Storage access blocked or restricted
    }
  }, []);

  // Listen for beforeinstallprompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      try {
        localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
      } catch {
        // Ignored
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }
      return false;
    }

    if (isIos() && !isStandalone()) {
      setIsIOSDialogOpen(true);
      return false;
    }

    return false;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    } catch {
      // Ignored
    }
  }, []);

  const isIosDevice = isIos();
  const isInstallable = !isInstalled && (deferredPrompt !== null || isIosDevice);
  const shouldShowBanner = !isInstalled && !isBannerDismissed && isInstallable && sessionCount >= 2;

  return {
    isInstallable,
    isStandalone: isInstalled,
    isIosDevice,
    isIOSDialogOpen,
    shouldShowBanner,
    promptInstall,
    openIOSDialog: () => setIsIOSDialogOpen(true),
    closeIOSDialog: () => setIsIOSDialogOpen(false),
    dismissBanner,
  };
}
