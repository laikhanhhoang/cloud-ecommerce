import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';
import { normalizeApiError } from '../api/apiError';
import { useAddCartItem } from '../hooks/useAddCartItem';
import { useAuthStore } from '../store/useAuthStore';
import Toast from '../components/ui/Toast';
import ProductDetailContent from '../components/ui/ProductDetailContent';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: product, isLoading, isError } = useProductDetail(id);

  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const addCartItemMutation = useAddCartItem();

  const [toastState, setToastState] = useState({ show: false, message: '' });

  const nextUrl = useMemo(() => `${location.pathname}${location.search}`, [location.pathname, location.search]);

  const showToast = useCallback((message) => {
    setToastState({ show: true, message });
    setTimeout(() => setToastState({ show: false, message: '' }), 2000);
  }, []);

  const redirectToLogin = useCallback(() => {
    navigate(`/login?next=${encodeURIComponent(nextUrl)}`);
  }, [navigate, nextUrl]);

  const getFriendlyCartErrorMessage = (err) => {
    const normalized = normalizeApiError(err);
    const details = normalized?.details;

    if (details && typeof details === 'object') {
      if (Array.isArray(details.quantity) && details.quantity.length > 0) return String(details.quantity[0]);
      if (typeof details.detail === 'string' && details.detail) return details.detail;
      const firstKey = Object.keys(details)[0];
      if (firstKey && Array.isArray(details[firstKey]) && details[firstKey].length > 0) {
        return String(details[firstKey][0]);
      }
    }

    return normalized?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  };

  const handleAddToCart = (cartItem) => {
    if (!cartItem) return;

    if (isAuthInitialized && !user) {
      redirectToLogin();
      return;
    }

    if (!cartItem.variantId) {
      showToast('Vui lòng chọn phiên bản và màu hợp lệ.');
      return;
    }

    addCartItemMutation.mutate(
      { product_variant_id: cartItem.variantId, quantity: 1 },
      {
        onSuccess: () => {
          showToast('Thêm thành công');
        },
        onError: (err) => {
          const normalized = normalizeApiError(err);
          if (normalized?.statusCode === 401) {
            redirectToLogin();
            return;
          }
          showToast(getFriendlyCartErrorMessage(err));
        },
      },
    );
  };

  const handleBuyNow = async (cartItem) => {
    if (!cartItem) return;

    if (isAuthInitialized && !user) {
      redirectToLogin();
      return;
    }

    if (!cartItem.variantId) {
      showToast('Vui lòng chọn phiên bản và màu hợp lệ.');
      return;
    }

    try {
      await addCartItemMutation.mutateAsync({ product_variant_id: cartItem.variantId, quantity: 1 });
      navigate('/checkout');
    } catch (err) {
      const normalized = normalizeApiError(err);
      if (normalized?.statusCode === 401) {
        redirectToLogin();
        return;
      }
      showToast(getFriendlyCartErrorMessage(err));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 flex-shrink-0 bg-gray-200 aspect-square rounded-xl"></div>
          <div className="w-full md:w-1/2 flex flex-col gap-4 py-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="mt-8 h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm!</h2>
        <p className="text-gray-500 mb-6">Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Trở về trang chủ
        </button>
      </div>
    );
  }

  return (
    <>
      <ProductDetailContent
        key={product.id}
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
      <Toast
        show={toastState.show}
        message={toastState.message}
        onClose={() => setToastState({ show: false, message: '' })}
      />
    </>
  );
}
