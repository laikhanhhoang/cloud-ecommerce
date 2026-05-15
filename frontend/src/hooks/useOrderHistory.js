import { useQuery } from '@tanstack/react-query';
import { fetchOrderHistory } from '../api/orderApi';

export function useOrderHistory(page = 1, options = {}) {
  return useQuery({
    queryKey: ['orders', 'history', page],
    queryFn: () => fetchOrderHistory({ page }),
    ...options,
  });
}
