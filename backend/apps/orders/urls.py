from django.urls import path
from .views import OrderCreateView, OrderHistoryView, OrderDetailView

urlpatterns = [
    path("create/", OrderCreateView.as_view(), name="order-create"),
    path("history/", OrderHistoryView.as_view(), name="order-history"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),  
]