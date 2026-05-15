import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCartCount } from '../api/cartApi';
import { getErrorStatusCode } from '../api/apiError';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * GET /api/carts/count/
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

  const query = useQuery({
    queryKey: cartQueryKeys.count(),
    queryFn: fetchCartCount,
    staleTime: 0,
    retry: false,
    enabled,
    ...restOptions,
  });

  useEffect(() => {
    if (query.isSuccess) {
      setCartCount(query.data?.cart_count ?? 0);
      if (onSuccess) onSuccess(query.data);
    }
  }, [query.isSuccess, query.data, setCartCount, onSuccess]);

  useEffect(() => {
    if (query.isError) {
      if (getErrorStatusCode(query.error) === 401) {
        setCartCount(0);
      }
      if (onError) onError(query.error);
    }
  }, [query.isError, query.error, setCartCount, onError]);

  return query;
}
