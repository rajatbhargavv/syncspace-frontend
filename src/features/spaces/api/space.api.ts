import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type {
  Space,
  SpaceSummary,
  PublicSpace,
  CreateSpaceInput,
  UpdateSpaceInput,
} from '../types/space.types';

// ── Response envelopes (internal, unwrapped before returning) ──

interface SpacesResponse {
  message?: string;
  spaces: SpaceSummary[];
}

interface SpaceResponse {
  message?: string;
  space: Space;
}

interface PublicSpaceResponse {
  message?: string;
  space: PublicSpace;
}

// ── API functions ──

export async function getMySpaces(): Promise<SpaceSummary[]> {
  const response = await http.get<SpacesResponse>(API_ENDPOINTS.SPACES.LIST);
  return response.spaces;
}

export async function getSpaceById(id: string): Promise<Space> {
  const response = await http.get<SpaceResponse>(API_ENDPOINTS.SPACES.BY_ID(id));
  return response.space;
}

export async function getPublicSpace(id: string): Promise<PublicSpace> {
  const response = await http.get<PublicSpaceResponse>(API_ENDPOINTS.SPACES.PUBLIC(id));
  return response.space;
}

export async function createSpace(data: CreateSpaceInput): Promise<Space> {
  const response = await http.post<SpaceResponse>(API_ENDPOINTS.SPACES.CREATE, data);
  return response.space;
}

export async function updateSpace(id: string, data: UpdateSpaceInput): Promise<Space> {
  const response = await http.put<SpaceResponse>(API_ENDPOINTS.SPACES.UPDATE(id), data);
  return response.space;
}

export async function deactivateSpace(id: string): Promise<Space> {
  const response = await http.patch<SpaceResponse>(API_ENDPOINTS.SPACES.DEACTIVATE(id));
  return response.space;
}
