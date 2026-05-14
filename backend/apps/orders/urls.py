from django.urls import path

from apps.orders.views import (
    CartCountAPIView,
    CartDetailAPIView,
    CartItemCreateAPIView,
    CartItemDetailAPIView,
)

urlpatterns = [
    path("cart/", CartDetailAPIView.as_view(), name="cart-detail"),
    path("cart/count/", CartCountAPIView.as_view(), name="cart-count"),
    path("cart/items/", CartItemCreateAPIView.as_view(), name="cart-item-create"),
    path(
        "cart/items/<int:item_id>/",
        CartItemDetailAPIView.as_view(),
        name="cart-item-detail",
    ),
]
