from __future__ import annotations

from django.db import transaction
from django.db.models import Prefetch, Sum
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order, OrderItem
from apps.orders.serializers import (
    AddCartItemInputSerializer,
    CartSerializer,
    UpdateCartItemInputSerializer,
)
from apps.orders.services.cart import get_cart, get_or_create_cart, recalculate_order_total
from apps.products.models import ProductImage, ProductVariant


def _get_cart_detail_queryset():
    main_image_prefetch = Prefetch(
        "items__product_variant__product__images",
        queryset=ProductImage.objects.filter(is_main=True),
        to_attr="main_image_list",
    )

    return (
        Order.objects.filter(status=Order.Status.IN_CART)
        .select_related("user")
        .prefetch_related(
            "items__product_variant__variant_image",
            "items__product_variant__product",
            main_image_prefetch,
        )
    )


class CartDetailAPIView(APIView):
    def get(self, request):
        cart = get_cart(request.user)
        if cart is None:
            return Response({"message": "Người dùng chưa có cart."}, status=status.HTTP_200_OK)

        # Sync unit_price/total_amount for in_cart to match spec.
        recalculate_order_total(cart)

        cart = _get_cart_detail_queryset().filter(pk=cart.pk, user=request.user).first()
        if cart is None:
            return Response({"message": "Người dùng chưa có cart."}, status=status.HTTP_200_OK)

        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class CartCountAPIView(APIView):
    def get(self, request):
        cart = get_cart(request.user)
        if cart is None:
            return Response({"count": 0}, status=status.HTTP_200_OK)

        total = (
            OrderItem.objects.filter(order=cart)
            .aggregate(total=Sum("quantity"))
            .get("total")
        )
        return Response({"count": int(total or 0)}, status=status.HTTP_200_OK)


class CartItemCreateAPIView(APIView):
    def post(self, request):
        input_serializer = AddCartItemInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        variant: ProductVariant = input_serializer.validated_data["product_variant"]
        add_quantity: int = input_serializer.validated_data["quantity"]

        with transaction.atomic():
            cart = get_or_create_cart(request.user)

            # Lock existing item row if it exists.
            existing_item = (
                OrderItem.objects.select_for_update()
                .filter(order=cart, product_variant_id=variant.id)
                .first()
            )

            if existing_item is None:
                # unit_price is current price; recalc will also keep it in sync.
                OrderItem.objects.create(
                    order=cart,
                    product_variant_id=variant.id,
                    quantity=add_quantity,
                    unit_price=variant.price,
                )
            else:
                new_quantity = existing_item.quantity + add_quantity

                # Validate stock against total desired quantity.
                variant_latest = ProductVariant.objects.filter(id=variant.id).only("id", "stock").first()
                if variant_latest is None:
                    raise NotFound("Product variant không tồn tại.")
                if variant_latest.stock <= 0:
                    raise ValidationError({"quantity": ["Sản phẩm đã hết hàng."]})
                if new_quantity > variant_latest.stock:
                    raise ValidationError({"quantity": ["Số lượng vượt quá tồn kho."]})

                existing_item.quantity = new_quantity
                existing_item.save(update_fields=["quantity"])

            recalculate_order_total(cart)

        cart = _get_cart_detail_queryset().filter(user=request.user).order_by("-created_at").first()
        if cart is None:
            # Shouldn't happen because we just created/updated.
            raise NotFound("Người dùng chưa có cart.")

        output = CartSerializer(cart, context={"request": request}).data
        return Response(
            {"message": "Đã thêm sản phẩm vào giỏ hàng.", "data": output},
            status=status.HTTP_200_OK,
        )


class CartItemDetailAPIView(APIView):
    def _get_item_or_404(self, *, request, item_id: int) -> OrderItem:
        item = (
            OrderItem.objects.select_related("order", "product_variant")
            .filter(
                pk=item_id,
                order__user=request.user,
                order__status=Order.Status.IN_CART,
            )
            .first()
        )
        if item is None:
            raise NotFound("Item không tồn tại hoặc không thuộc người dùng.")
        return item

    def patch(self, request, item_id: int):
        item = self._get_item_or_404(request=request, item_id=item_id)

        input_serializer = UpdateCartItemInputSerializer(
            data=request.data,
            context={"order_item": item},
        )
        input_serializer.is_valid(raise_exception=True)
        new_quantity: int = input_serializer.validated_data["quantity"]

        with transaction.atomic():
            # Lock row to avoid race.
            item = (
                OrderItem.objects.select_for_update()
                .select_related("order", "product_variant")
                .get(pk=item.pk)
            )

            item.quantity = new_quantity
            item.save(update_fields=["quantity"])

            recalculate_order_total(item.order)

        cart = _get_cart_detail_queryset().filter(pk=item.order_id, user=request.user).first()
        if cart is None:
            raise NotFound("Người dùng chưa có cart.")

        output = CartSerializer(cart, context={"request": request}).data
        return Response(
            {"message": "Đã cập nhật số lượng.", "data": output},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, item_id: int):
        item = self._get_item_or_404(request=request, item_id=item_id)

        with transaction.atomic():
            # Lock row to avoid race.
            item = (
                OrderItem.objects.select_for_update()
                .select_related("order")
                .get(pk=item.pk)
            )
            order = item.order
            item.delete()

            # Keep the cart order even if it becomes empty.
            recalculate_order_total(order)

        cart = _get_cart_detail_queryset().filter(pk=order.pk, user=request.user).first()
        if cart is None:
            # Order should still exist per spec.
            raise NotFound("Người dùng chưa có cart.")

        output = CartSerializer(cart, context={"request": request}).data
        return Response(
            {"message": "Đã xóa sản phẩm khỏi giỏ hàng.", "data": output},
            status=status.HTTP_200_OK,
        )
