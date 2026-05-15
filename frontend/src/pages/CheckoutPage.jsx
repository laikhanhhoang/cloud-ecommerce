import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useCart } from '../hooks/useCart';
import { useClearCart } from '../hooks/useClearCart';
import { useCreateOrder } from '../hooks/useCreateOrder';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);

  const cartQuery = useCart({
    enabled: isAuthInitialized && !!user,
  });

  const clearCartMutation = useClearCart();
  const { mutate: mutateSubmitOrder, isPending } = useCreateOrder();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    orderNote: '',
    paymentMethod: 'cod'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cart = cartQuery.data;
    const cartItems = Array.isArray(cart?.items) ? cart.items : [];
    const hasMessage = typeof cart?.message === 'string' && cart.message.trim().length > 0;

    if (hasMessage || cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    const formattedItems = cartItems.map((item) => {
      const variantId = item?.product_variant?.id;
      return {
        variant_id: variantId === undefined || variantId === null ? '' : Number(variantId),
        quantity: Number(item?.quantity ?? 0)
      };
    });

    const orderData = {
      full_name: formData.fullName,
      phone_number: formData.phone,
      shipping_address: formData.address,
      payment_method: formData.paymentMethod,
      order_note: formData.orderNote,
      items: formattedItems
    };

    mutateSubmitOrder(orderData, {
      onSuccess: async (data) => {
        try {
          const itemIds = cartItems.map((item) => item.id).filter((value) => value !== null && value !== undefined);
          await clearCartMutation.mutateAsync(itemIds);
        } catch {
          // Ignore clear-cart errors for now; user still completed checkout mock.
        }

        if (formData.paymentMethod === 'payos' && data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          alert(data.message || 'Thanh toán thành công');
          navigate('/orders');
        }
      },
      onError: () => {
        alert('Có lỗi xảy ra trong quá trình xử lý đơn hàng.');
      }
    });
  };

  const nextUrl = `${location.pathname}${location.search}`;
  const handleGoLogin = () => navigate(`/login?next=${encodeURIComponent(nextUrl)}`);

  const cart = cartQuery.data;
  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const hasMessage = typeof cart?.message === 'string' && cart.message.trim().length > 0;
  const isCartEmpty = hasMessage || cartItems.length === 0;

  if (!isAuthInitialized) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-600">
          Đang kiểm tra đăng nhập...
        </div>
      </div>
    );
  }

  if (isAuthInitialized && !user) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Bạn chưa đăng nhập</h1>
          <p className="text-gray-500 mt-2">Vui lòng đăng nhập để tiếp tục thanh toán.</p>
          <button
            onClick={handleGoLogin}
            className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            Đi tới đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (cartQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-600">
          Đang tải thông tin giỏ hàng...
        </div>
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Không thể tải giỏ hàng</h1>
          <p className="text-gray-500 mt-2">Vui lòng thử lại sau.</p>
          <button
            onClick={() => cartQuery.refetch()}
            className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
        <p className="text-gray-500 mt-2">Vui lòng điền thông tin giao hàng của bạn</p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Thông tin liên hệ */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 border-b pb-2">
              Thông tin liên hệ
            </h2>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
                  placeholder="Ví dụ: 0912 345 678"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ giao hàng <span className="text-red-500">*</span>
                </label>
                <textarea 
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition resize-none"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                ></textarea>
              </div>

              <div>
                <label htmlFor="orderNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (Tuỳ chọn)
                </label>
                <textarea 
                  id="orderNote"
                  name="orderNote"
                  value={formData.orderNote}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition resize-none"
                  placeholder="Lưu ý khi giao hàng..."
                ></textarea>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 border-b pb-2">
              Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
              </label>
              
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="payos"
                  checked={formData.paymentMethod === 'payos'}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-800">Thanh toán chuyển khoản (PayOS)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 mt-8 border-t border-gray-100">
            <button
              type="submit"
              disabled={isPending || clearCartMutation.isPending || isCartEmpty}
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition shadow-sm text-lg uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || clearCartMutation.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}