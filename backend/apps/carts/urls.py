from django.urls import path
from .views import AddToCartView, CartDetailView, CartCountView

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('count/', CartCountView.as_view(), name='cart-count'),
    path('add/', AddToCartView.as_view(), name='add-to-cart'),
]