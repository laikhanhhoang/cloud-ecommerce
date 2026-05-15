# apps/orders/views.py
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.carts.models import Cart
from .models import Order, OrderItem
from .serializers import OrderSerializer
from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order
from .serializers import OrderListSerializer
from .filters import OrderFilter
from rest_framework.pagination import PageNumberPagination

class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            cart_items = cart.items.select_related('product_variant')
            
            if not cart_items.exists():
                return Response({"error": "Giỏ hàng trống"}, status=400)

            # 1. Tạo đơn hàng (Chưa lưu total_amount vì cần tính từ item)
            order = Order.objects.create(
                user=user,
                full_name=request.data.get('full_name'),
                phone_number=request.data.get('phone_number'),
                shipping_address=request.data.get('shipping_address'),
                payment_method=request.data.get('payment_method', Order.PaymentMethod.COD),
                order_note=request.data.get('order_note', ''),
                total_amount=0 # Sẽ cập nhật sau
            )

            total_amount = 0
            order_items = []

            for item in cart_items:
                # 2. Kiểm tra tồn kho (Stock)
                if item.product_variant.stock < item.quantity:
                    transaction.set_rollback(True) # Hủy transaction
                    return Response({
                        "error": f"Sản phẩm {item.product_variant.sku} không đủ hàng"
                    }, status=400)

                # 3. Tạo OrderItem Snapshot
                unit_price = item.product_variant.price
                subtotal = unit_price * item.quantity
                total_amount += subtotal

                order_items.append(OrderItem(
                    order=order,
                    product_variant=item.product_variant,
                    quantity=item.quantity,
                    unit_price=unit_price
                ))

                # 4. Trừ kho
                item.product_variant.stock -= item.quantity
                item.product_variant.save()

            # Lưu hàng loạt OrderItems
            OrderItem.objects.bulk_create(order_items)

            # 5. Cập nhật tổng tiền đơn hàng
            order.total_amount = total_amount
            
            # Logic PayOS (Nếu có)
            if order.payment_method == Order.PaymentMethod.PAYOS:
                # Giả sử hàm call_payos_api() trả về link
                # order.payment_link = call_payos_api(order)
                order.payment_link = f"https://pay.payos.vn/mock-link/{order.id}"
            
            order.save()

            # 6. Xóa giỏ hàng sau khi đặt thành công
            cart.items.all().delete()

            return Response(OrderSerializer(order).data, status=201)

        except Cart.DoesNotExist:
            return Response({"error": "Không tìm thấy giỏ hàng"}, status=404)
        
        
class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'

class OrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderListSerializer
    pagination_class = OrderPagination
    
    # Khai báo sử dụng bộ lọc
    filter_backends = [DjangoFilterBackend]
    filterset_class = OrderFilter

    def get_queryset(self):
        # Chỉ lấy đơn hàng của chính user đó và tối ưu SQL
        return Order.objects.filter(user=self.request.user).prefetch_related(
            'items__product_variant__product'
        ).order_by('-created_at')

class OrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            order = Order.objects.prefetch_related('items__product_variant__product').get(user=request.user, pk=pk)
            return Response(OrderSerializer(order, context={'request': request}).data)
        except Order.DoesNotExist:
            return Response({"error": "Không tìm thấy đơn hàng"}, status=404)