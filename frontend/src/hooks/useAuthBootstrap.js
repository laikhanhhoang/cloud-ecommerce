import { useEffect } from 'react';
import { fetchCurrentUser } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';

export function useAuthBootstrap() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const markAuthInitialized = useAuthStore((state) => state.markAuthInitialized);

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      try {
        const user = await fetchCurrentUser();
        if (!isCancelled) {
          setUser(user);
        }
      } catch (err) {
        const status = err?.response?.status;

        if (!isCancelled && status === 401) {
          clearUser();
        }
      } finally {
        if (!isCancelled) {
          markAuthInitialized();
        }
      }
    }

    bootstrap();

    return () => {
      isCancelled = true;
    };
  }, [setUser, clearUser, markAuthInitialized]);
}
