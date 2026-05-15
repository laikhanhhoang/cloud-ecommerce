import { useQuery } from '@tanstack/react-query';
import { fetchOrderDetail } from '../api/orderApi';

export function useOrderDetail(id, options = {}) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => fetchOrderDetail(id),
    enabled: !!id,
    ...options,
  });
}
