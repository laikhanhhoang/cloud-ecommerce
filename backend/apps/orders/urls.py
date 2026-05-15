from django.urls import path
from .views import CheckoutView, OrderListView, OrderDetailView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('history/', OrderListView.as_view(), name='order-history'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]