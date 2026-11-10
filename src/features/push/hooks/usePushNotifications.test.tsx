import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as pushApi from '../api/push.api';
import * as pushUtils from '../utils/pushUtils';
import { usePushNotifications } from './usePushNotifications';

vi.mock('@/app/providers/useAuth', () => ({
  useAuth: () => ({
    user: { _id: 'user_1', name: 'Tester' },
    isAuthenticated: true,
  }),
}));

vi.mock('../api/push.api', () => ({
  getPublicKey: vi.fn().mockResolvedValue('test_vapid_key'),
  subscribe: vi.fn().mockResolvedValue({ message: 'Subscribed' }),
  unsubscribe: vi.fn().mockResolvedValue({ message: 'Unsubscribed' }),
  sendTest: vi.fn().mockResolvedValue({ message: 'Test sent' }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('usePushNotifications state machine and actions', () => {
  const originalNotification = window.Notification;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'Notification', {
      value: originalNotification,
      configurable: true,
      writable: true,
    });
  });

  it('evaluates to "unsupported" when push is not supported', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(false);

    const { result } = renderHook(() => usePushNotifications());
    await act(async () => {
      await result.current.refetchState();
    });

    expect(result.current.state).toBe('unsupported');
    expect(result.current.isSubscribed).toBe(false);
  });

  it('evaluates to "ios-needs-install" when on iOS and not in standalone mode', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(true);
    vi.spyOn(pushUtils, 'isStandalone').mockReturnValue(false);

    const { result } = renderHook(() => usePushNotifications());
    await act(async () => {
      await result.current.refetchState();
    });

    expect(result.current.state).toBe('ios-needs-install');
  });

  it('evaluates to "denied" when notification permission is denied', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);
    vi.spyOn(pushUtils, 'getPermissionState').mockReturnValue('denied');

    const { result } = renderHook(() => usePushNotifications());
    await act(async () => {
      await result.current.refetchState();
    });

    expect(result.current.state).toBe('denied');
  });

  it('evaluates to "default" when notification permission is default', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);
    vi.spyOn(pushUtils, 'getPermissionState').mockReturnValue('default');

    const { result } = renderHook(() => usePushNotifications());
    await act(async () => {
      await result.current.refetchState();
    });

    expect(result.current.state).toBe('default');
  });

  it('evaluates to "granted-subscribed" when permission is granted and subscription exists', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);
    vi.spyOn(pushUtils, 'getPermissionState').mockReturnValue('granted');

    const mockSub = {
      endpoint: 'https://push.example.com/123',
      toJSON: () => ({
        endpoint: 'https://push.example.com/123',
        keys: { p256dh: 'p256', auth: 'auth' },
      }),
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(mockSub),
          },
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePushNotifications());
    await act(async () => {
      await result.current.refetchState();
    });

    expect(result.current.state).toBe('granted-subscribed');
    expect(result.current.isSubscribed).toBe(true);
  });

  it('evaluates to "granted-unsubscribed" when permission is granted but no subscription', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);
    vi.spyOn(pushUtils, 'getPermissionState').mockReturnValue('granted');

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
          },
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePushNotifications());
    await act(async () => {
      await result.current.refetchState();
    });

    expect(result.current.state).toBe('granted-unsubscribed');
    expect(result.current.isSubscribed).toBe(false);
  });

  it('enable() calls Notification.requestPermission, pushManager.subscribe, and API', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);
    vi.spyOn(pushUtils, 'isIos').mockReturnValue(false);
    vi.spyOn(pushUtils, 'urlBase64ToUint8Array').mockReturnValue(new Uint8Array([1, 2, 3]));

    Object.defineProperty(window, 'Notification', {
      value: {
        requestPermission: vi.fn().mockResolvedValue('granted'),
        permission: 'granted',
      },
      configurable: true,
      writable: true,
    });

    const mockSub = {
      endpoint: 'https://push.example.com/123',
      toJSON: () => ({
        endpoint: 'https://push.example.com/123',
        keys: { p256dh: 'p256', auth: 'auth' },
      }),
    };

    const subscribeMock = vi.fn().mockResolvedValue(mockSub);
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: subscribeMock,
          },
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePushNotifications());

    let success = false;
    await act(async () => {
      success = await result.current.enable();
    });

    expect(success).toBe(true);
    expect(pushApi.getPublicKey).toHaveBeenCalled();
    expect(subscribeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userVisibleOnly: true,
      }),
    );
    expect(pushApi.subscribe).toHaveBeenCalledWith({
      endpoint: 'https://push.example.com/123',
      keys: { p256dh: 'p256', auth: 'auth' },
    });
    expect(result.current.state).toBe('granted-subscribed');
  });

  it('disable() calls API unsubscribe and subscription.unsubscribe()', async () => {
    vi.spyOn(pushUtils, 'isPushSupported').mockReturnValue(true);

    const mockUnsubscribe = vi.fn().mockResolvedValue(true);
    const mockSub = {
      endpoint: 'https://push.example.com/123',
      unsubscribe: mockUnsubscribe,
    };

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(mockSub),
          },
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => usePushNotifications());

    let success = false;
    await act(async () => {
      success = await result.current.disable();
    });

    expect(success).toBe(true);
    expect(pushApi.unsubscribe).toHaveBeenCalledWith('https://push.example.com/123');
    expect(mockUnsubscribe).toHaveBeenCalled();
    expect(result.current.state).toBe('granted-unsubscribed');
  });

  it('sendTest calls API sendTest', async () => {
    const { result } = renderHook(() => usePushNotifications());

    await act(async () => {
      await result.current.sendTest();
    });

    expect(pushApi.sendTest).toHaveBeenCalled();
  });
});
