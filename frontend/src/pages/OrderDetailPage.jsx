import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderDetail } from '../hooks/useOrderDetail';
import { formatCurrency } from '../utils/formatCurrency';
import { ArrowLeft } from 'lucide-react';
import { resolveMediaUrl } from '../utils/resolveMediaUrl';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);

  const { data: order, isLoading, isError } = useOrderDetail(id, {
    enabled: isAuthInitialized && !!user && !!id,
  });

  if (!isAuthInitialized) return <div className="p-8 text-center">Đang tải...</div>;
  if (!user) {
    navigate('/login?next=' + encodeURIComponent(`/orders/${id}`));
    return null;
  }

  if (isLoading) return <div className="p-8 text-center">Đang tải chi tiết đơn hàng...</div>;
  if (isError || !order) return <div className="p-8 text-center text-red-600">Không thể tải đơn hàng này.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </Link>
      
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{order.id}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium capitalize">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Thông tin giao hàng</h3>
            <p className="text-gray-700 py-1"><strong>Họ tên:</strong> {order.full_name}</p>
            <p className="text-gray-700 py-1"><strong>Số điện thoại:</strong> {order.phone_number}</p>
            <p className="text-gray-700 py-1"><strong>Địa chỉ:</strong> {order.shipping_address}</p>
            {order.order_note && <p className="text-gray-700 py-1"><strong>Ghi chú:</strong> {order.order_note}</p>}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Thông tin thanh toán</h3>
            <p className="text-gray-700 py-1"><strong>Phương thức:</strong> {order.payment_method === 'payos' ? 'PayOS' : 'Thanh toán khi nhận hàng (COD)'}</p>
            <p className="text-gray-700 py-1"><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
            <p className="text-gray-700 py-1 mt-2 text-xl"><strong>Tổng tiền:</strong> <span className="text-red-600 font-bold">{formatCurrency(order.total_amount)}</span></p>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-4 text-gray-800">Sản phẩm đã mua</h3>
        <div className="border rounded-lg overflow-hidden divide-y">
          {order.items?.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-gray-50">
              <img 
                src={resolveMediaUrl(item.product_main_image) || 'https://placehold.co/100x100/png?text=No+Image'} 
                alt={item.product_name} 
                className="w-20 h-20 object-cover rounded border flex-shrink-0"
              />
              <div className="flex-1">
                <h4 className="font-medium text-lg">{item.product_name}</h4>
                <p className="text-sm text-gray-500">
                  {item.variant_version ? `Phiên bản: ${item.variant_version}` : ''}
                  {item.variant_version && item.color ? ' • ' : ''}
                  {item.color ? `Màu: ${item.color}` : ''}
                </p>
                <p className="text-sm text-gray-700 mt-1 font-medium">SL: {item.quantity} x {formatCurrency(item.unit_price)}</p>
              </div>
              <div className="font-bold text-red-600 text-lg w-full sm:w-auto text-right mt-2 sm:mt-0">
                {formatCurrency(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
