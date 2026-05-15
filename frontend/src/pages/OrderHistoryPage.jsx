import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { formatCurrency } from '../utils/formatCurrency';
import { Package } from 'lucide-react';

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useOrderHistory(page, {
    enabled: isAuthInitialized && !!user,
  });

  if (!isAuthInitialized) return <div className="p-8 text-center">Đang tải...</div>;
  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl mb-4">Bạn chưa đăng nhập</h2>
        <button onClick={() => navigate('/login?next=/orders')} className="bg-blue-600 text-white px-4 py-2 rounded">Đăng nhập</button>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-center">Đang tải lịch sử đơn hàng...</div>;
  if (isError) return <div className="p-8 text-center">Có lỗi xảy ra khi lấy lịch sử đơn hàng.</div>;

  const orders = data?.results || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="w-6 h-6" /> Lịch sử đơn hàng
      </h1>
      
      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Mã ĐH</th>
                <th className="p-4">Ngày đặt</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium">#{order.id}</td>
                  <td className="p-4">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm capitalize">{order.status}</span>
                  </td>
                  <td className="p-4 font-semibold text-red-600">{formatCurrency(order.total_amount)}</td>
                  <td className="p-4 text-right">
                    <Link to={`/orders/${order.id}`} className="text-blue-600 hover:underline">Xem</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.count > 0 && (data.next || data.previous) && (
        <div className="mt-6 flex justify-center gap-2">
          <button 
            disabled={!data.previous} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >Trước</button>
          <button 
            disabled={!data.next} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >Sau</button>
        </div>
      )}
    </div>
  );
}
