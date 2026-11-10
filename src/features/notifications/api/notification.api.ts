import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';

interface UnreadCountResponse {
  unreadCount: number;
}

export async function getUnreadCount(): Promise<number> {
  const response = await http.get<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
  return response.unreadCount;
}
