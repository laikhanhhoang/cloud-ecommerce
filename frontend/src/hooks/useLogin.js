import { useMutation } from '@tanstack/react-query';
import { fetchCurrentUser, login } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload) => login(payload),
    onSuccess: async () => {
      const user = await fetchCurrentUser();
      setUser(user);
    },
  });
}
