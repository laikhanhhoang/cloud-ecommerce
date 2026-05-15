from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.models import ProductVariant


class ProductVariantSerializer(serializers.ModelSerializer):

    class Meta:
        model   = ProductVariant
        fields  = ['id', 'sku', 'price', 'version', 'color', 'stock']

class CartItemSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()
    product_variant = ProductVariantSerializer(read_only=True)
    unit_price      = serializers.SerializerMethodField()
    line_total      = serializers.SerializerMethodField()

    class Meta:
        model   = CartItem
        fields  = ['id', 'product_variant', 'quantity', 'unit_price', 'line_total', 'thumbnail']

    def get_unit_price(self, obj):
        return obj.product_variant.price

    def get_line_total(self, obj):
        return obj.quantity * obj.product_variant.price
    
    def get_thumbnail(self, obj):
        """Return the main image URL, fallback to first image, or None."""
        images = obj.product_variant.product.images.all()
        if not images:
            return None
        
        main = next((img for img in images if img.is_main), None)
        image = main or images[0]
        
        request = self.context.get('request')
        return request.build_absolute_uri(image.image.url) if request else image.image.url

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    # total_amount lấy từ @property total_price trong model
    total_amount = serializers.ReadOnlyField(source='total_price')
    cart_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        # CHỈ ĐỂ CÁC TRƯỜNG THỰC SỰ CÓ TRONG MODEL CART
        fields = ['id', 'total_amount', 'cart_count', 'items']

    def get_cart_count(self, obj):
        # Tận dụng prefetch ở View, dùng len() sẽ không bị query lại DB
        return obj.items.all().count()