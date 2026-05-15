import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../api/cartApi';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * GET /api/carts/
 * Note: backend may return 200 with { message } when user has no cart.
 */
export function useCart(options = {}) {
  return useQuery({
    queryKey: cartQueryKeys.cart(),
    queryFn: fetchCart,
    staleTime: 0,
    retry: false,
    ...options,
  });
}
