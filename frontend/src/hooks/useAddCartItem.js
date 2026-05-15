import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addCartItem } from '../api/cartApi';
import { cartQueryKeys } from './cartQueryKeys';

/**
 * POST /api/carts/add/
 *
 * @example
 * const addMutation = useAddCartItem();
 * addMutation.mutate({ product_variant_id: 100, quantity: 1 });
 */
export function useAddCartItem(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => addCartItem(payload),
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() }),
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.count() }),
      ]);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
}
