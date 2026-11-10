export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface SwNavigateMessage {
  type: 'NAVIGATE';
  url: string;
  notificationId?: string;
}

export interface SwSkipWaitingMessage {
  type: 'SKIP_WAITING';
}

export type SwClientMessage = SwNavigateMessage | SwSkipWaitingMessage;

export interface PushNotificationPayload {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  renotify?: boolean;
  data?: {
    url?: string;
    notificationId?: string;
    unreadCount?: number;
    [key: string]: unknown;
  };
  timestamp?: number;
}
