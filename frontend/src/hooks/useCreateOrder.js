import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../api/orderApi';
import { cartQueryKeys } from './cartQueryKeys';

export function useCreateOrder(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createOrder(payload),
    ...options,
    onSuccess: async (data, variables, context) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() }),
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.count() }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
}
