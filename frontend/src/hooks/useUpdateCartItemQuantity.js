import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCartItemQuantity } from '../api/cartApi';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * PATCH /api/cart/items/{item_id}/
 *
 * @example
 * const updateMutation = useUpdateCartItemQuantity();
 * updateMutation.mutate({ itemId: 55, quantity: 2 });
 */
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItemQuantity(itemId, { quantity }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() }),
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.count() }),
      ]);
    },
  });
}
