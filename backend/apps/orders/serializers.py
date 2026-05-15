from rest_framework import serializers
from django.db import transaction
from apps.products.models import ProductVariant
from .models import Order, OrderItem

class OrderItemInputSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            "full_name",
            "phone_number",
            "shipping_address",
            "payment_method",
            "order_note",
            "items",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        items_data = validated_data.pop("items")

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                total_amount=0,
                **validated_data
            )

            total = 0
            order_items = []

            variant_ids = [i["variant_id"] for i in items_data]
            variants = (
                ProductVariant.objects
                .select_for_update()
                .filter(id__in=variant_ids)
                .in_bulk()
            )

            for item in items_data:
                variant = variants.get(item["variant_id"])

                if not variant:
                    raise serializers.ValidationError(f"Variant {item['variant_id']} not found")

                qty = item["quantity"]

                if variant.stock < qty:
                    raise serializers.ValidationError(f"Not enough stock for variant {variant.id}")

                variant.stock -= qty
                variant.save(update_fields=["stock"])

                total += variant.price * qty

                product = variant.product
                main_image = product.images.filter(is_main=True).first()

                order_items.append(
                    OrderItem(
                        order=order,
                        product_variant=variant,

                        product_name=product.name,
                        variant_version=variant.version,
                        color=variant.color,
                        product_main_image=main_image.image.url if main_image else None,

                        quantity=qty,
                        unit_price=variant.price
                    )
                )

            OrderItem.objects.bulk_create(order_items)

            order.total_amount = total
            order.save(update_fields=["total_amount"])

        return order
    
class OrderHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "payment_method",
            "total_amount",
            "created_at",
        ]

class OrderItemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product_name",
            "variant_version",
            "color",
            "product_main_image",
            "quantity",
            "unit_price",
            "subtotal",
        ]

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "payment_method",
            "total_amount",
            "created_at",
            "updated_at",
            "full_name",
            "phone_number",
            "shipping_address",
            "order_note",
            "items",
        ]