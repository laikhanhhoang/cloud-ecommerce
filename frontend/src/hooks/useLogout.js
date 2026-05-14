import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout } from '../api/authApi';
import { getErrorStatusCode } from '../api/apiError';
import { useAuthStore } from '../store/useAuthStore';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: async () => {
      useAuthStore.getState().clearUser();
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: async (err) => {
      const status = getErrorStatusCode(err);

      // Backend may return 400 for expired session; treat as logged out for UX.
      if (status === 400 || status === 401) {
        useAuthStore.getState().clearUser();
        await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      }
    },
  });
}
