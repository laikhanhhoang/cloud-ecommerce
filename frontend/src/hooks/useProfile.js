import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../api/profileApi';

export function useProfile(options = {}) {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchProfile,
    staleTime: 60_000,
    retry: false,
    ...options,
  });
}
