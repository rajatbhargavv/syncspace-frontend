import React from 'react';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { usePushNotifications } from '../hooks/usePushNotifications';

export const SettingsNotificationSection: React.FC = () => {
  const { state, isSubscribed, isLoading, testCooldown, enable, disable, sendTest } =
    usePushNotifications();

  const handleToggle = (checked: boolean) => {
    if (checked) {
      void enable();
    } else {
      void disable();
    }
  };

  return (
    <div className="space-y-6 rounded-card border border-border bg-surface p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-text">Push Notifications</h2>
          <p className="mt-1 text-sm text-text-muted">
            Receive real-time alerts for mentions, comments, and task assignments even when
            SyncSpace is closed.
          </p>
        </div>
        <div className="shrink-0">
          {state === 'granted-subscribed' && <Badge variant="success">Active on this device</Badge>}
          {state === 'granted-unsubscribed' && <Badge variant="outline">Unsubscribed</Badge>}
          {state === 'default' && <Badge variant="default">Not enabled</Badge>}
          {state === 'denied' && <Badge variant="error">Blocked</Badge>}
          {state === 'ios-needs-install' && <Badge variant="outline">Install required</Badge>}
          {state === 'unsupported' && <Badge variant="default">Unsupported</Badge>}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        {state === 'unsupported' && (
          <div className="bg-bg/50 rounded-input border border-border p-4 text-sm text-text-muted">
            <p className="font-medium text-text">
              This browser doesn&apos;t support push notifications.
            </p>
            <p className="mt-1">
              For real-time background alerts, use Chrome, Firefox, Edge, or install SyncSpace as a
              PWA from Safari on iOS 16.4+.
            </p>
          </div>
        )}

        {state === 'ios-needs-install' && (
          <div className="bg-bg/50 space-y-2 rounded-input border border-border p-4 text-sm text-text-muted">
            <p className="font-semibold text-text">Install SyncSpace on your Home Screen</p>
            <p>
              iOS requires web apps to be added to the Home Screen before push notifications can be
              enabled:
            </p>
            <ol className="list-decimal space-y-1.5 pl-5 text-xs">
              <li>
                Tap the <span className="font-semibold text-text">Share</span> button in
                Safari&apos;s bottom toolbar.
              </li>
              <li>
                Select <span className="font-semibold text-text">Add to Home Screen</span>.
              </li>
              <li>
                Open <span className="font-semibold text-text">SyncSpace</span> from your Home
                Screen, return to Settings, and turn on notifications.
              </li>
            </ol>
          </div>
        )}

        {state === 'denied' && (
          <div className="border-error/20 bg-error/10 space-y-2 rounded-input border p-4 text-sm text-text">
            <p className="font-semibold text-error">Notifications are blocked for this site</p>
            <p className="text-xs text-text-muted">
              Permission was previously denied. You can re-enable alerts directly in your browser
              settings:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-text-muted">
              <li>
                <strong className="text-text">Chrome / Edge / Brave:</strong> Click the settings /
                padlock icon on the left of the address bar and toggle{' '}
                <span className="font-medium text-text">Notifications</span> to &quot;Allow&quot;.
              </li>
              <li>
                <strong className="text-text">Safari (macOS):</strong> Go to Safari &gt; Settings
                &gt; Websites &gt; Notifications, find SyncSpace, and select &quot;Allow&quot;.
              </li>
              <li>
                <strong className="text-text">Mobile:</strong> Open device Settings &gt; Apps &gt;
                Browser / SyncSpace &gt; Notifications, and enable alerts.
              </li>
            </ul>
          </div>
        )}

        {(state === 'default' ||
          state === 'granted-subscribed' ||
          state === 'granted-unsubscribed') && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-text">Device push alerts</span>
                <p className="text-xs text-text-muted">
                  Deliver alerts to this device even when the browser or tab is inactive.
                </p>
                <p className="mt-1 text-[11px] text-text-muted">
                  Using Brave? Ensure &quot;Use Google services for push messaging&quot; is enabled in{' '}
                  <code className="text-text">brave://settings/privacy</code>.
                </p>
              </div>
              <Toggle
                aria-label="Toggle push notifications"
                checked={isSubscribed}
                disabled={isLoading}
                onChange={handleToggle}
              />
            </div>

            {state === 'granted-subscribed' && (
              <div className="bg-bg/50 flex flex-wrap items-center justify-between gap-3 rounded-input border border-border p-4">
                <div className="text-xs text-text-muted">
                  <p className="font-medium text-text">Test notification delivery</p>
                  <p>Send a test push to verify alerts appear on your device.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  isLoading={isLoading}
                  disabled={isLoading || testCooldown > 0}
                  onClick={() => void sendTest()}
                >
                  {testCooldown > 0 ? `Resend in ${testCooldown}s` : 'Send test notification'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
