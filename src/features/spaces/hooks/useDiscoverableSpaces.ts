import { useQuery } from '@tanstack/react-query';
import { searchDiscoverableSpaces } from '../api/space.api';

export function useDiscoverableSpaces(search: string, enabled: boolean) {
  return useQuery({
    queryKey: ['spaces', 'discover', search],
    queryFn: () => searchDiscoverableSpaces(search),
    enabled,
  });
}
