from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.models import Product, ProductVariant
from apps.products.serializers import ProductListSerializer


class ProductVariantSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    stock   = serializers.IntegerField(source='stock_qty') 

    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'price', 'version', 'color', 'stock', 'product']

class CartItemSerializer(serializers.ModelSerializer):
    product_variant = ProductVariantSerializer(read_only=True)
    unit_price = serializers.SerializerMethodField()
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product_variant', 'quantity', 'unit_price', 'line_total']

    def get_unit_price(self, obj):
        return obj.product_variant.price

    def get_line_total(self, obj):
        return obj.quantity * obj.product_variant.price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.ReadOnlyField(source='total_price')
    cart_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id', 'status', 'total_amount', 'full_name', 'phone_number', 
            'shipping_address', 'payment_method', 'cart_count', 'items'
        ]

    def get_cart_count(self, obj):
        return obj.items.count()