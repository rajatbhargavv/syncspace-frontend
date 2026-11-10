import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type { SpaceMember } from '../types/member.types';

interface MembersResponse {
  members: SpaceMember[];
}

interface MemberResponse {
  member?: SpaceMember;
  message?: string;
}

export async function getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
  const response = await http.get<MembersResponse>(API_ENDPOINTS.SPACES.MEMBERS(spaceId));
  return response.members;
}

export async function joinSpace(spaceId: string): Promise<SpaceMember | undefined> {
  const response = await http.post<MemberResponse>(API_ENDPOINTS.SPACES.JOIN(spaceId));
  return response.member;
}

export async function leaveSpace(spaceId: string): Promise<void> {
  await http.post(API_ENDPOINTS.SPACES.LEAVE(spaceId));
}

export async function removeMember(spaceId: string, userId: string): Promise<void> {
  await http.delete(API_ENDPOINTS.SPACES.REMOVE_MEMBER(spaceId, userId));
}
