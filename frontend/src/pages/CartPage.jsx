import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CartItem from '../components/ui/CartItem';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCart } from '../hooks/useCart';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import { useUpdateCartItemQuantity } from '../hooks/useUpdateCartItemQuantity';

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);

  const cartQuery = useCart({
    enabled: isAuthInitialized && !!user,
  });

  const removeMutation = useRemoveCartItem();
  const updateQuantityMutation = useUpdateCartItemQuantity();

  const cart = cartQuery.data;
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const hasMessage = typeof cart?.message === 'string' && cart.message.trim().length > 0;

  const totalItems = Number.isFinite(Number(cart?.cart_count))
    ? Number(cart.cart_count)
    : cartItems.reduce((sum, item) => sum + Number(item?.quantity ?? 0), 0);

  const totalAmount = typeof cart?.totalAmount === 'number' && Number.isFinite(cart.totalAmount)
    ? cart.totalAmount
    : 0;

  const handleGoHome = () => navigate('/');
  const handleGoLogin = () => navigate(`/login?next=${encodeURIComponent(`${location.pathname}${location.search}`)}`);

  if (isAuthInitialized && !user) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Bạn chưa đăng nhập</h2>
        <p className="text-gray-500 mb-8">Vui lòng đăng nhập để xem giỏ hàng.</p>
        <button
          onClick={handleGoLogin}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Đi tới đăng nhập
        </button>
      </div>
    );
  }

  if (cartQuery.isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="text-gray-600">Đang tải giỏ hàng...</div>
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Không thể tải giỏ hàng</h2>
        <p className="text-gray-500 mb-8">Vui lòng thử lại sau.</p>
        <button
          onClick={() => cartQuery.refetch()}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (hasMessage || cartItems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-12 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Chưa có sản phẩm nào trong giỏ hàng của bạn.</p>
        <button
          onClick={handleGoHome}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          {cartItems.map((item) => (
            <CartItem 
              key={item.id} 
              item={item} 
              onRemove={(itemId) => removeMutation.mutate(itemId)}
              onUpdateQuantity={(itemId, quantity) => updateQuantityMutation.mutate({ itemId, quantity })}
              isRemoving={removeMutation.isPending}
              isUpdating={updateQuantityMutation.isPending}
              error={updateQuantityMutation.error}
              errorItemId={updateQuantityMutation.variables?.itemId}
            />
          ))}
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-4">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">Thông tin đơn hàng</h2>
            
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Tổng số lượng:</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            
            <div className="flex justify-between mb-6">
              <span className="text-gray-600 text-lg">Tổng tiền:</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              Thanh toán toàn bộ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

