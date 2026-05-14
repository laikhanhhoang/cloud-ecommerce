import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../api/profileApi';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}
