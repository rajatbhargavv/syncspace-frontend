import { MEMBER_ROLE, MEMBER_STATUS } from '@/config/constants';

export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS];
export type SpaceMemberRole = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE];

export interface SpaceMember {
  userId: {
    _id: string;
    name: string;
  };
  role: SpaceMemberRole;
  status: MemberStatus;
  joinedAt: string;
}
