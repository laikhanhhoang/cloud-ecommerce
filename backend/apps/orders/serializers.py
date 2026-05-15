from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductVariantSerializer # Reuse serializer bạn đã có

class OrderItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    line_total = serializers.ReadOnlyField(source='subtotal')

    class Meta:
        model = OrderItem
        fields = ['id', 'product_variant', 'quantity', 'unit_price', 'line_total']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'full_name', 'phone_number', 'shipping_address', 
            'total_amount', 'status', 'status_display', 
            'payment_method', 'payment_method_display', 
            'payment_link', 'order_note', 'created_at', 'items'
        ]
        read_only_fields = ['total_amount', 'status', 'payment_link']

# apps/orders/serializers.py

class OrderListSerializer(serializers.ModelSerializer):
    # Trả về tên trạng thái tiếng Việt
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # Lấy thông tin tóm tắt của các sản phẩm trong đơn
    items_summary = serializers.SerializerMethodField()
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 
            'status', 
            'status_display', 
            'total_amount', 
            'created_at', 
            'item_count', 
            'items_summary'
        ]

    def get_items_summary(self, obj):
        # Chỉ lấy thông tin tối giản của các sản phẩm để giảm tải JSON
        items = obj.items.all()
        return [{
            "name": item.product_variant.product.name,
            "variant": f"{item.product_variant.version} - {item.product_variant.color}",
            "image": self.context['request'].build_absolute_uri(item.product_variant.product.main_image_url) if item.product_variant.product.main_image_url else None,
            "quantity": item.quantity
        } for item in items]