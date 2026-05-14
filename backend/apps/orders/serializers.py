from __future__ import annotations

from decimal import Decimal

from rest_framework import serializers
from django.db.models import Sum
from rest_framework.exceptions import NotFound

from apps.orders.models import Order, OrderItem
from apps.products.models import Product, ProductImage, ProductVariant


# -----------------------------
# Output serializers
# -----------------------------


class CartProductSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "main_image"]

    def get_main_image(self, obj: Product):
        # Prefer the prefetched main image to avoid N+1 queries.
        if hasattr(obj, "main_image_list") and obj.main_image_list:
            image: ProductImage = obj.main_image_list[0]
            url = image.image.url if image.image else None
        else:
            url = obj.main_image_url
        if not url:
            return None

        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(url)
        return url


class CartProductVariantSerializer(serializers.ModelSerializer):
    product = CartProductSerializer(read_only=True)

    class Meta:
        model = ProductVariant
        fields = ["id", "sku", "price", "version", "color", "stock", "product"]


class CartItemSerializer(serializers.ModelSerializer):
    product_variant = CartProductVariantSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_variant",
            "quantity",
            "unit_price",
            "line_total",
        ]

    def get_line_total(self, obj: OrderItem) -> Decimal:
        return (obj.unit_price or Decimal("0")) * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    cart_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total_amount",
            "full_name",
            "phone_number",
            "shipping_address",
            "payment_method",
            "cart_count",
            "items",
        ]

    def get_cart_count(self, obj: Order) -> int:
        # Prefer prefetched items when available to avoid extra queries.
        items = getattr(obj, "items", None)
        if items is not None and hasattr(items, "all"):
            try:
                # If prefetched, items.all() uses cache.
                return sum(item.quantity for item in items.all())
            except Exception:
                pass
        total = (
            OrderItem.objects.filter(order=obj)
            .aggregate(total=Sum("quantity"))
            .get("total")
        )
        return int(total or 0)


# -----------------------------
# Input serializers
# -----------------------------


class AddCartItemInputSerializer(serializers.Serializer):
    product_variant_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1, required=False, default=1)

    def validate(self, attrs):
        variant_id = attrs.get("product_variant_id")
        quantity = attrs.get("quantity", 1)

        variant = ProductVariant.objects.filter(id=variant_id).only("id", "stock").first()
        if variant is None:
            # Spec: variant không tồn tại -> 404
            raise NotFound("Product variant không tồn tại.")

        if variant.stock <= 0:
            raise serializers.ValidationError({"quantity": ["Sản phẩm đã hết hàng."]})

        if quantity > variant.stock:
            raise serializers.ValidationError({"quantity": ["Số lượng vượt quá tồn kho."]})

        attrs["product_variant"] = variant
        return attrs


class UpdateCartItemInputSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

    def validate_quantity(self, value: int) -> int:
        # Explicitly disallow 0; min_value already enforces this.
        if value <= 0:
            raise serializers.ValidationError("Quantity phải >= 1.")
        return value

    def validate(self, attrs):
        """Optional stock validation.

        If the view passes `order_item` or `product_variant` in serializer context,
        we validate the requested quantity against current stock.
        """

        quantity = attrs.get("quantity")
        order_item: OrderItem | None = self.context.get("order_item")
        product_variant: ProductVariant | None = self.context.get("product_variant")

        variant = product_variant
        if variant is None and order_item is not None:
            variant = order_item.product_variant

        if variant is not None:
            # Re-fetch minimal fields to ensure up-to-date stock.
            variant = ProductVariant.objects.filter(id=variant.id).only("id", "stock").first()
            if variant is None:
                raise serializers.ValidationError({"product_variant": ["Product variant không tồn tại."]})

            if variant.stock <= 0:
                raise serializers.ValidationError({"quantity": ["Sản phẩm đã hết hàng."]})

            if quantity is not None and quantity > variant.stock:
                raise serializers.ValidationError({"quantity": ["Số lượng vượt quá tồn kho."]})

        return attrs
