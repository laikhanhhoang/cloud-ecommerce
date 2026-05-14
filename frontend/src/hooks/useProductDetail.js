import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../api/productApi';

export const useProductDetail = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetchProductById(id);
      return response;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
