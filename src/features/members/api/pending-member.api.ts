import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type { SpaceMember } from '../types/member.types';

interface MembersResponse {
  members: SpaceMember[];
}

export async function getPendingMembers(spaceId: string): Promise<SpaceMember[]> {
  const response = await http.get<MembersResponse>(API_ENDPOINTS.SPACES.MEMBERS(spaceId), {
    params: { status: 'PENDING' },
  });
  return response.members;
}

export async function approveMember(spaceId: string, userId: string): Promise<void> {
  await http.post(API_ENDPOINTS.SPACES.APPROVE_MEMBER(spaceId, userId));
}

export async function rejectMember(spaceId: string, userId: string): Promise<void> {
  await http.post(API_ENDPOINTS.SPACES.REJECT_MEMBER(spaceId, userId));
}
