import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Prefetch

from apps.products.models import ProductVariant
from .models import Cart, CartItem
from .serializers import CartSerializer


# GET /api/carts/ : Lấy chi tiết giỏ hàng của người dùng hiện tại
class CartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cart = Cart.objects.prefetch_related(
                Prefetch(
                    'items',
                    queryset=CartItem.objects.select_related(
                        'product_variant',
                        'product_variant__product'
                    ).prefetch_related(
                        'product_variant__product__images'
                    )
                )
            ).filter(user=request.user).first()

            if not cart:
                return Response({
                    "id": None,
                    "items": [],
                    "total_amount": 0,
                })

            serializer = CartSerializer(cart)

            return Response(serializer.data)

        except Exception as e:
            traceback.print_exc()

            return Response(
                {"error": str(e)},
                status=500
            )
    
# GET /api/carts/count/ : Trả về số lượng item trong giỏ hàng
class CartCountView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            count = cart.items.count()
        except Cart.DoesNotExist:
            count = 0
            
        return Response({"cart_count": count}, status=status.HTTP_200_OK)
    
    
# POST /api/carts/add/ request_data = {"product_variant_id": 123, "quantity": 2}  : POST để thêm sản phẩm vào giỏ hàng   
class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        variant_id = request.data.get('product_variant_id')
        quantity = int(request.data.get('quantity', 1))

        variant = ProductVariant.objects.filter(id=variant_id).first()

        if not variant:
            return Response({"error": "Variant not found"}, status=404)

        # 1. Lấy hoặc tạo giỏ hàng cho user
        cart, _ = Cart.objects.get_or_create(user=request.user)

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
