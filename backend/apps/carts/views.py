from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Prefetch

from backend.apps.orders.services import cart

from .models import Cart, CartItem
from .serializers import CartSerializer


# GET /api/cart/ : Lấy chi tiết giỏ hàng của người dùng hiện tại
class CartDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Tối ưu hóa truy vấn để lấy toàn bộ dữ liệu trong 1-2 câu SQL
        cart = Cart.objects.prefetch_related(
            Prefetch(
                'items',
                queryset=CartItem.objects.select_related(
                    'product_variant', 
                    'product_variant__product'
                ).prefetch_related('product_variant__product__images')
            )
        ).filter(user=request.user).first()

        if not cart:
            return Response({
                "id": None,
                "items": [],
                "total_price": 0,
                "status": "in_cart",
                "full_name": None,
                "phone_number": None,
                "shipping_address": None,
                "payment_method": None,
            }, status=status.HTTP_200_OK)

        # Truyền context={'request': request} để Serializer có thể tạo URL ảnh đầy đủ
        serializer = CartSerializer(cart, context={'request': request})
        
        # Thêm các trường null theo yêu cầu của bạn vì model Cart đã tách biệt
        data = serializer.data
        extra_fields = {
            "status": "in_cart",
            "full_name": None,
            "phone_number": None,
            "shipping_address": None,
            "payment_method": None,
        }
        # Cập nhật các trường này vào data nếu serializer chưa có
        for field, value in extra_fields.items():
            if field not in data or data[field] is None:
                data[field] = value
                
        return Response(data)
    
    
# GET /api/cart/count/ : Trả về số lượng item trong giỏ hàng
class CartCountView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            count = cart.items.count()
        except Cart.DoesNotExist:
            count = 0
            
        return Response({"cart_count": count}, status=status.HTTP_200_OK)
    
    
    
class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        variant_id = request.data.get('product_variant_id')
        quantity = int(request.data.get('quantity', 1))

        # 1. Lấy hoặc tạo giỏ hàng cho user
        cart, created = Cart.objects.get_or_create(user=request.user)

        # 2. Kiểm tra xem item đã có trong giỏ chưa
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product_variant_id=variant_id,
            defaults={'quantity': quantity}
        )

        # 3. Nếu đã có rồi thì cộng dồn số lượng
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({"message": "Đã thêm vào giỏ hàng"}, status=status.HTTP_201_CREATED)