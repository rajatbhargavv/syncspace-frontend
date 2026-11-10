export type PushPermissionState =
  | 'unsupported'
  | 'ios-needs-install'
  | 'default'
  | 'denied'
  | 'granted-subscribed'
  | 'granted-unsubscribed';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface PushPublicKeyResponse {
  publicKey: string;
}

export interface PushActionResponse {
  message: string;
}
