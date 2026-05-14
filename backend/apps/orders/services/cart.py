from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from django.db import transaction
from django.db.models import DecimalField, ExpressionWrapper, F, Sum

from apps.orders.models import Order, OrderItem
from apps.products.models import ProductVariant
from apps.users.models import UserAuth


@dataclass(frozen=True)
class CartTotals:
    cart_count: int
    total_amount: Decimal


def get_cart(user: UserAuth) -> Order | None:
    """Read-only cart lookup.

    Important: does NOT auto-create.
    """

    return (
        Order.objects.filter(user=user, status=Order.Status.IN_CART)
        .order_by("-created_at")
        .first()
    )


def get_or_create_cart(user: UserAuth) -> Order:
    """Get or create the active cart for a user.

    This helper is intended for write flows (add/update/delete). It uses a DB
    transaction and locks existing cart rows to reduce race conditions.
    """

    with transaction.atomic():
        cart = (
            Order.objects.select_for_update()
            .filter(user=user, status=Order.Status.IN_CART)
            .order_by("-created_at")
            .first()
        )
        if cart is not None:
            return cart

        # Explicitly set nullable fields to None for clarity.
        return Order.objects.create(
            user=user,
            status=Order.Status.IN_CART,
            total_amount=Decimal("0"),
            full_name=None,
            phone_number=None,
            shipping_address=None,
            payment_method=None,
        )


def get_cart_item(order: Order, variant_id: int) -> OrderItem | None:
    return OrderItem.objects.filter(order=order, product_variant_id=variant_id).first()


def recalculate_order_total(order: Order) -> CartTotals:
    """Recalculate cart totals and persist `Order.total_amount`.

    Behavior (per spec):
    - If `order.status == in_cart`, each item's `unit_price` is updated to the
      current `ProductVariant.price` before computing totals.
    - For non-cart orders, unit_price is left unchanged (snapshot).
    """

    if order.status == Order.Status.IN_CART:
        # Keep unit_price in sync with the current ProductVariant.price.
        # (price is decimal_places=0; unit_price is decimal_places=2)
        items = list(
            OrderItem.objects.filter(order=order)
            .select_related("product_variant")
            .only("id", "unit_price", "quantity", "product_variant__price")
        )
        changed = False
        for item in items:
            current_price = item.product_variant.price
            if item.unit_price != current_price:
                item.unit_price = current_price
                changed = True
        if changed:
            OrderItem.objects.bulk_update(items, ["unit_price"])

    line_total_expr = ExpressionWrapper(
        F("unit_price") * F("quantity"),
        output_field=DecimalField(max_digits=12, decimal_places=2),
    )

    aggregates = (
        OrderItem.objects.filter(order=order)
        .aggregate(
            cart_count=Sum("quantity"),
            total_amount=Sum(line_total_expr),
        )
    )

    cart_count = int(aggregates.get("cart_count") or 0)
    total_amount = aggregates.get("total_amount") or Decimal("0")

    Order.objects.filter(pk=order.pk).update(total_amount=total_amount)

    return CartTotals(cart_count=cart_count, total_amount=total_amount)


def validate_stock_or_raise(*, variant: ProductVariant, desired_quantity: int) -> None:
    """Reusable stock validation for write flows."""

    if variant.stock <= 0:
        raise ValueError("Sản phẩm đã hết hàng.")
    if desired_quantity > variant.stock:
        raise ValueError("Số lượng vượt quá tồn kho.")
