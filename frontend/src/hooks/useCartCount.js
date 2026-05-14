import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCartCount } from '../api/cartApi';
import { getErrorStatusCode } from '../api/apiError';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * GET /api/cart/count/
 */
export function useCartCount(options = {}) {
  const { enabled: enabledOption, onSuccess, onError, ...restOptions } = options;
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const setCartCount = useCartStore((state) => state.setCartCount);

  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!user) setCartCount(0);
  }, [isAuthInitialized, user, setCartCount]);

  const enabled = Boolean(enabledOption ?? true) && isAuthInitialized && !!user;

  return useQuery({
    queryKey: cartQueryKeys.count(),
    queryFn: fetchCartCount,
    staleTime: 0,
    retry: false,
    enabled,
    onSuccess: (data) => {
      setCartCount(data?.count ?? 0);
      onSuccess?.(data);
    },
    onError: (err) => {
      if (getErrorStatusCode(err) === 401) {
        setCartCount(0);
      }
      onError?.(err);
    },
    ...restOptions,
  });
}
