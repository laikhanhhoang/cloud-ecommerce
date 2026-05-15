import CategoryNav from '../components/ui/CategoryNav';
import Banner from '../components/ui/Banner';
import ProductCard from '../components/ui/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useSearchParams } from 'react-router-dom';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { data, isLoading, isError } = useProducts({ page });

  const shouldShowPagination = Boolean(
    data && (data.next || data.previous || (typeof data.count === 'number' && data.count > (data.results?.length ?? 0)))
  );

  const canPrev = Boolean(data?.previous) && page > 1;
  const canNext = Boolean(data?.next);

  const updatePage = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    const safePage = Math.max(1, Number(nextPage) || 1);

    if (safePage === 1) nextParams.delete('page');
    else nextParams.set('page', String(safePage));

    setSearchParams(nextParams);
  };

  return (
    <div className="pb-16 bg-gray-50">
      <CategoryNav />
      <Banner />
      
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 border-l-4 border-blue-600 pl-3">
          Sản phẩm nổi bật
        </h2>
        
        {/* Loading State / Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-lg shadow-sm p-4 flex flex-col h-[320px]">
                <div className="bg-gray-200 aspect-square w-full rounded-md mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center text-red-600 p-8 bg-red-50 border border-red-200 rounded-lg shadow-sm">
            <h3 className="font-bold text-lg mb-2">Đã có lỗi xảy ra!</h3>
            <p>Vui lòng kiểm tra lại kết nối mạng hoặc thử tải lại trang.</p>
          </div>
        ) : (
          /* Actual Data Rendering */
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data?.results?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {shouldShowPagination && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  type="button"
                  onClick={() => updatePage(page - 1)}
                  disabled={!canPrev}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Trang trước
                </button>

                <span className="text-sm font-medium text-gray-600">Trang {page}</span>

                <button
                  type="button"
                  onClick={() => updatePage(page + 1)}
                  disabled={!canNext}
                  className="px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
