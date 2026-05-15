import os
from django.conf import settings
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.orders.models import Order
from .serializers import OrderCreateSerializer, OrderDetailSerializer, OrderHistorySerializer
from rest_framework.pagination import PageNumberPagination
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from payos import PayOS

class OrderPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"  # optional
    max_page_size = 50


# POST /api/orders/create - Tạo đơn hàng mới
class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

'''
Input JSON Example:
{
  "full_name": "Nguyen Van A",
  "phone_number": "0900000000",
  "shipping_address": "HCMC",
  "payment_method": "cod",
  "order_note": "Giao giờ hành chính",
  "items": [
    {
      "variant_id": 1,
      "quantity": 2
    },
    {
      "variant_id": 5,
      "quantity": 1
    }
  ]
}
'''

# GET /api/orders/history - Lấy lịch sử đơn hàng của người dùng
class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = OrderPagination

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at") 
    

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items")
        )
    

@csrf_exempt
def webhook_handler(request):
    payOS = PayOS(
        client_id=settings.PAYOS_CLIENT_ID,
        api_key=settings.PAYOS_API_KEY,
        checksum_key=settings.PAYOS_CHECKSUM_KEY
    )    

    try:
        webhook_data = payOS.webhooks.verify(request.body)
        print(f"Thanh toán thành công: {webhook_data}")
        return JsonResponse({"message": "OK"}, status=200)
    except Exception as e:
        print(f"Webhook không hợp lệ nha Dev!: {e}")
        return JsonResponse({"message": "Invalid webhook"}, status=400)