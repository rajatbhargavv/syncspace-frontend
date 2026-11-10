import { http } from '@/lib/http/client';
import { API_ENDPOINTS } from '@/config/constants';
import type {
  PushActionResponse,
  PushPublicKeyResponse,
  PushSubscriptionPayload,
} from '../types/push.types';

export async function getPublicKey(): Promise<string> {
  const res = await http.get<PushPublicKeyResponse>(API_ENDPOINTS.PUSH.PUBLIC_KEY);
  return res.publicKey;
}

export async function subscribe(
  subscription: PushSubscriptionPayload,
): Promise<PushActionResponse> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
  return await http.post<PushActionResponse>(API_ENDPOINTS.PUSH.SUBSCRIBE, {
    subscription: {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    userAgent,
  });
}

export async function unsubscribe(endpoint: string): Promise<PushActionResponse> {
  return await http.delete<PushActionResponse>(API_ENDPOINTS.PUSH.UNSUBSCRIBE, {
    body: { endpoint },
  });
}

export async function sendTest(): Promise<PushActionResponse> {
  return await http.post<PushActionResponse>(API_ENDPOINTS.PUSH.TEST);
}
