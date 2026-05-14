import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/productApi';

/**
 * Custom hook quản lý call API fetchProducts bằng React Query
 * @param {Object} params - Query Parameters ({ keyword, category, brand, min_price, max_price, page })
 */
export function useProducts(params = {}) {
  return useQuery({
    // Sử dụng params làm queryKey để cache theo từng trường hợp
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 5 * 60 * 1000, // Caching dữ liệu trong 5 phút
  });
}