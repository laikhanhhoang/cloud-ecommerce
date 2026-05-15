import { useMutation } from '@tanstack/react-query';
import { submitOrder } from '../api/productApi';

export const useSubmitOrder = () => {
  return useMutation({
    mutationFn: (orderData) => submitOrder(orderData),
  });
};
