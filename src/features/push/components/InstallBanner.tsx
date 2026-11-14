import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { IOSInstallDialog } from './IOSInstallDialog';
import { PwaInstallGuideModal } from './PwaInstallGuideModal';

export const InstallBanner: React.FC = () => {
  const { shouldShowBanner, promptInstall, dismissBanner, isIOSDialogOpen, closeIOSDialog } =
    useInstallPrompt();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <>
      {shouldShowBanner && (
        <div
          role="region"
          aria-label="App install banner"
          className="border-accent/20 bg-accent/10 relative flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5 text-sm text-text"
        >
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">
              📱
            </span>
            <span>
              Install <strong className="font-semibold">SyncSpace</strong> on your phone or laptop
              for quick access and instant background notifications.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="mr-1 text-xs font-semibold text-accent hover:underline"
            >
              How to install 📲
            </button>
            <Button size="sm" onClick={() => void promptInstall()}>
              Install app
            </Button>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Dismiss install banner"
              onClick={dismissBanner}
            >
              ✕
            </IconButton>
          </div>
        </div>
      )}
      <IOSInstallDialog isOpen={isIOSDialogOpen} onClose={closeIOSDialog} />
      <PwaInstallGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};
