import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeCartItem } from '../api/cartApi';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * DELETE /api/cart/items/{item_id}/
 *
 * @example
 * const removeMutation = useRemoveCartItem();
 * removeMutation.mutate(55);
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => removeCartItem(itemId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() }),
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.count() }),
      ]);
    },
  });
}
