import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeCartItem } from '../api/cartApi';
import { useCartStore } from '../store/useCartStore';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * Clear server-side cart by deleting each item sequentially.
 * (Temporary approach for Task 9.9)
 *
 * @example
 * const clearCart = useClearCart();
 * await clearCart.mutateAsync([55, 56]);
 */
export function useClearCart() {
  const queryClient = useQueryClient();
  const setCartCount = useCartStore((state) => state.setCartCount);

  return useMutation({
    mutationFn: async (itemIds) => {
      const ids = Array.isArray(itemIds) ? itemIds : [];

      for (const itemId of ids) {
        // Delete sequentially to match backend expectations and simplify error handling.
        await removeCartItem(itemId);
      }

      return { clearedCount: ids.length };
    },
    onSuccess: async () => {
      setCartCount(0);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() }),
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.count() }),
      ]);
    },
  });
}
