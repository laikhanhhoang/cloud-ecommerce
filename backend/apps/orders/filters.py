from django_filters import rest_framework as filters
from apps.orders.models import Order

class OrderFilter(filters.FilterSet):
    status = filters.CharFilter(field_name="status", lookup_expr="exact")
    
    # Bạn có thể mở rộng thêm lọc theo ngày (Ví dụ: Shopee lọc đơn theo tháng)
    start_date = filters.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    end_date = filters.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Order
        fields = ['status', 'start_date', 'end_date']