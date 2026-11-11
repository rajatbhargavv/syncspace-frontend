import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type { UserProfile } from '../types/profile.types';

interface ProfileResponse {
  profile: UserProfile;
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  const response = await http.get<ProfileResponse>(API_ENDPOINTS.USERS.PROFILE(id));
  return response.profile;
}
