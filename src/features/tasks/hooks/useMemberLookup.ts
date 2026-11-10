import { useMemo } from 'react';
import { useSpaceMembers } from '@/features/members';

export interface SimpleMember {
  _id: string;
  name: string;
}

export interface MemberLookupResult {
  getMember: (userId: string) => SimpleMember | undefined;
  getName: (userId: string) => string;
  members: SimpleMember[];
  isLoading: boolean;
}

export function useMemberLookup(spaceId: string): MemberLookupResult {
  const { data: members = [], isLoading } = useSpaceMembers(spaceId);

  const memberMap = useMemo(() => {
    const map = new Map<string, SimpleMember>();
    for (const member of members) {
      if (member.userId._id) {
        map.set(member.userId._id, {
          _id: member.userId._id,
          name: member.userId.name,
        });
      }
    }
    return map;
  }, [members]);

  const getMember = (userId: string) => memberMap.get(userId);

  const getName = (userId: string): string => {
    const member = memberMap.get(userId);
    return member?.name ?? 'Former member';
  };

  const simpleMembers = useMemo(() => Array.from(memberMap.values()), [memberMap]);

  return {
    getMember,
    getName,
    members: simpleMembers,
    isLoading,
  };
}
