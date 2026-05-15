from django_filters import rest_framework as filters
from .models import Product

class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(
        field_name="base_price", 
        lookup_expr='gte'
    )

    max_price = filters.NumberFilter(
        field_name="base_price", 
        lookup_expr='lte'
    )
    
    # Lọc không phân biệt hoa thường và chứa chuỗi
    keyword = filters.CharFilter(field_name="name", lookup_expr='icontains')
    brand = filters.CharFilter(field_name="brand", lookup_expr='icontains')
    category = filters.CharFilter(field_name="category", lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['min_price', 'max_price', 'keyword', 'brand', 'category']