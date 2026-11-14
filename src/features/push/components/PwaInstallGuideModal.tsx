import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { isIos } from '../utils/pushUtils';

export interface PwaInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeviceTab = 'desktop' | 'android' | 'ios';

export const PwaInstallGuideModal: React.FC<PwaInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const { promptInstall, isInstallable, isStandalone } = useInstallPrompt();
  const [activeTab, setActiveTab] = useState<DeviceTab>(() => {
    if (typeof window !== 'undefined' && isIos()) return 'ios';
    if (typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)) return 'android';
    return 'desktop';
  });

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://syncspace.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&format=svg&data=${encodeURIComponent(appUrl)}`;

  const handleDirectInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Download SyncSpace App"
      description="Install SyncSpace as a native app on your phone, tablet, or laptop for instant notifications and offline access."
      size="lg"
    >
      <div className="space-y-5">
        {/* Device Switcher Tabs */}
        <div className="flex rounded-button border border-border bg-surface-hover/50 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-button py-2 text-xs font-semibold transition-all ${
              activeTab === 'desktop'
                ? 'bg-surface text-text shadow-sm border border-border'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <span>💻</span>
            <span>Laptop / PC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-button py-2 text-xs font-semibold transition-all ${
              activeTab === 'android'
                ? 'bg-surface text-text shadow-sm border border-border'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <span>🤖</span>
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-button py-2 text-xs font-semibold transition-all ${
              activeTab === 'ios'
                ? 'bg-surface text-text shadow-sm border border-border'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <span>🍎</span>
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Tab 1: Desktop / Laptop */}
        {activeTab === 'desktop' && (
          <div className="space-y-4">
            {/* Animated Laptop Mockup */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface/90 p-4 shadow-inner">
              {/* Window controls */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-error/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                </div>
                {/* Simulated address bar */}
                <div className="flex max-w-sm flex-1 items-center justify-between rounded-lg border border-border/80 bg-surface-hover/70 px-3 py-1 text-xs text-text-muted">
                  <span className="truncate">🔒 {appUrl}</span>
                  <div className="flex items-center gap-1.5 pl-2">
                    {/* Animated Install Icon with Pulse */}
                    <div className="relative flex items-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                      <span className="relative inline-flex items-center gap-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-text-inverse">
                        📥 Install
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-text-muted">⋮</div>
              </div>

              {/* Simulated desktop window body */}
              <div className="pt-3 pb-1 text-center">
                <p className="text-xs font-semibold text-text">SyncSpace Desktop App</p>
                <p className="text-[11px] text-text-muted">Runs independently with native window controls, dock icon, and instant load.</p>
              </div>
            </div>

            {/* Steps */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">1</span>
                  <span>Look at Address Bar</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  In Chrome, Edge, or Brave, look at the right side of the address bar at the top of your browser.
                </p>
              </div>

              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">2</span>
                  <span>Click 'Install' Icon</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Click the install icon (looks like a monitor or download symbol 📥) or click ⋮ → 'Install SyncSpace'.
                </p>
              </div>

              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">3</span>
                  <span>Confirm Install</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Click "Install" in the popup. SyncSpace opens in its own window and pins to your taskbar/dock.
                </p>
              </div>
            </div>

            {isInstallable && (
              <div className="flex justify-center pt-1">
                <Button variant="primary" size="md" onClick={() => void handleDirectInstall()}>
                  📥 Install SyncSpace on this Laptop Now
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Android Phone */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            {/* Animated Phone Mockup */}
            <div className="relative mx-auto max-w-xs overflow-hidden rounded-2xl border-2 border-border bg-surface p-4 shadow-lg">
              {/* Phone Status bar */}
              <div className="flex items-center justify-between text-[10px] text-text-muted border-b border-border/40 pb-2">
                <span>9:41</span>
                <span>📶 🔋 100%</span>
              </div>
              {/* Phone Chrome header */}
              <div className="mt-2 flex items-center justify-between rounded-lg bg-surface-hover/80 p-2 text-xs">
                <span className="text-text-muted truncate">🔒 {appUrl}</span>
                <div className="relative flex items-center">
                  <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent opacity-75" />
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 text-xs font-bold text-accent">⋮</span>
                </div>
              </div>
              {/* Simulated drop menu */}
              <div className="mt-2 rounded-lg border border-border bg-surface p-2 text-xs shadow-md space-y-1">
                <div className="text-text-muted px-2 py-1">New tab</div>
                <div className="flex items-center justify-between rounded bg-accent/15 px-2 py-1.5 font-semibold text-accent ring-1 ring-accent/30">
                  <span>📱 Install app</span>
                  <span className="text-[10px] bg-accent text-text-inverse px-1 rounded">TAP HERE</span>
                </div>
                <div className="text-text-muted px-2 py-1">Desktop site</div>
              </div>
            </div>

            {/* Android Steps */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">1</span>
                  <span>Open in Chrome</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Open Chrome browser on your Android device and navigate to SyncSpace.
                </p>
              </div>

              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">2</span>
                  <span>Tap Three Dots ⋮</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Tap the three vertical dots (⋮) in the top-right corner of Chrome.
                </p>
              </div>

              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">3</span>
                  <span>Tap 'Install app'</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Select <strong className="text-text">"Install app"</strong> or <strong className="text-text">"Add to Home screen"</strong>. SyncSpace will be added to your app drawer!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: iPhone / iPad */}
        {activeTab === 'ios' && (
          <div className="space-y-4">
            {/* Animated iOS Mockup */}
            <div className="relative mx-auto max-w-xs overflow-hidden rounded-2xl border-2 border-border bg-surface p-4 shadow-lg">
              <div className="flex items-center justify-between text-[10px] text-text-muted border-b border-border/40 pb-2">
                <span>9:41</span>
                <span>5G 🔋</span>
              </div>
              <div className="my-4 text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-xl font-bold text-text-inverse shadow-md">
                  SS
                </div>
                <p className="mt-1 text-xs font-semibold text-text">SyncSpace</p>
                <p className="text-[10px] text-text-muted">Fast, fluid & native on iOS</p>
              </div>
              {/* Safari bottom bar simulation */}
              <div className="mt-2 flex items-center justify-around rounded-xl bg-surface-hover/90 p-2.5 text-sm border border-border/50">
                <span className="text-text-muted">‹</span>
                <span className="text-text-muted">›</span>
                {/* Pulsing share icon */}
                <div className="relative flex items-center">
                  <span className="animate-ping absolute -top-1 -right-1 h-3 w-3 rounded-full bg-accent opacity-75" />
                  <span className="rounded-md bg-accent/20 p-1 text-accent ring-1 ring-accent/40 font-bold">
                    ⎋
                  </span>
                </div>
                <span className="text-text-muted">📖</span>
                <span className="text-text-muted">⊞</span>
              </div>
            </div>

            {/* iOS Steps */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">1</span>
                  <span>Open in Safari</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Open Safari on your iPhone or iPad (Chrome on iOS does not support PWA installation).
                </p>
              </div>

              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">2</span>
                  <span>Tap Share Button ⎋</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Tap the <strong className="text-text">Share</strong> button at the bottom of the screen (the square with an arrow pointing up).
                </p>
              </div>

              <div className="rounded-card border border-border/70 bg-surface/60 p-3">
                <div className="flex items-center gap-2 font-semibold text-xs text-accent">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[11px]">3</span>
                  <span>Add to Home Screen</span>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  Scroll down and tap <strong className="text-text">"Add to Home Screen"</strong> (➕), then tap <strong className="text-text">"Add"</strong> in top-right.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp-Style QR Code Scan for Mobile Users */}
        <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
          <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm">
            <img
              src={qrCodeUrl}
              alt="Scan to open on phone"
              className="h-24 w-24 object-contain"
              loading="lazy"
            />
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-accent">
              <span>📷 WhatsApp-Style Quick Scan</span>
            </div>
            <h4 className="text-sm font-semibold text-text">Want SyncSpace on your phone right now?</h4>
            <p className="text-xs text-text-muted">
              Point your phone camera at this QR code to instantly open SyncSpace on your mobile browser and add it to your home screen!
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-text-muted">
            {isStandalone ? '✓ You are currently running the installed PWA' : 'Available for Windows, macOS, Android, and iOS'}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
