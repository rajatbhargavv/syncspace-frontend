import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http } from '@/lib/http/client';
import { getPublicKey, subscribe, unsubscribe, sendTest } from './push.api';

vi.mock('@/lib/http/client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('push.api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPublicKey calls GET /api/push/public-key', async () => {
    vi.mocked(http.get).mockResolvedValueOnce({ publicKey: 'test_key_123' });
    const key = await getPublicKey();
    expect(http.get).toHaveBeenCalledWith('/api/push/public-key');
    expect(key).toBe('test_key_123');
  });

  it('subscribe calls POST /api/push/subscribe with payload', async () => {
    vi.mocked(http.post).mockResolvedValueOnce({ message: 'Subscribed' });
    const payload = {
      endpoint: 'https://push.example.com/sub/123',
      keys: { p256dh: 'p256', auth: 'auth_key' },
    };
    const res = await subscribe(payload);
    expect(http.post).toHaveBeenCalledWith(
      '/api/push/subscribe',
      expect.objectContaining({
        subscription: payload,
      }),
    );
    expect(res.message).toBe('Subscribed');
  });

  it('unsubscribe calls DELETE /api/push/subscribe with endpoint', async () => {
    vi.mocked(http.delete).mockResolvedValueOnce({ message: 'Unsubscribed' });
    const endpoint = 'https://push.example.com/sub/123';
    const res = await unsubscribe(endpoint);
    expect(http.delete).toHaveBeenCalledWith('/api/push/subscribe', {
      body: { endpoint },
    });
    expect(res.message).toBe('Unsubscribed');
  });

  it('sendTest calls POST /api/push/test', async () => {
    vi.mocked(http.post).mockResolvedValueOnce({ message: 'Test sent' });
    const res = await sendTest();
    expect(http.post).toHaveBeenCalledWith('/api/push/test');
    expect(res.message).toBe('Test sent');
  });
});
