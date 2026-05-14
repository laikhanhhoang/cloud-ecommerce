import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem } from '../api/cartApi';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * POST /api/cart/items/
 *
 * @example
 * const addMutation = useAddCartItem();
 * addMutation.mutate({ product_variant_id: 100, quantity: 1 });
 */
export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => addCartItem(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() }),
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.count() }),
      ]);
    },
  });
}
