from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Prefetch
from apps.products.models import Product, ProductImage
from apps.products.filters import ProductFilter
from .serializers import ProductListSerializer, ProductDetailSerializer

class ProductListAPIView(APIView):
    # Cho phép truy cập công khai nếu danh sách sản phẩm không cần đăng nhập
    # (Ghi đè lại IsAuthenticated trong settings nếu cần)
    permission_classes = [] 

    def get(self, request):
        # 1. Tối ưu truy vấn (Chỉ lấy ảnh main)
        main_image_prefetch = Prefetch(
            'images',
            queryset=ProductImage.objects.filter(is_main=True),
            to_attr='main_image_list'
        )

        # 2. Queryset
        queryset = Product.objects.all().prefetch_related(main_image_prefetch).order_by('-created_at')

        # 3. Bộ lọc
        filterset = ProductFilter(request.GET, queryset=queryset)
        if not filterset.is_valid():
            return Response(filterset.errors, status=400)
        
        # 4. Phân trang (Sử dụng cấu hình từ settings.py)
        # self.paginator sẽ tự tìm đến 'DEFAULT_PAGINATION_CLASS' bạn đã khai báo
        paginator = self.paginator 
        result_page = paginator.paginate_queryset(filterset.qs, request, view=self)
        
        # 5. Serializer
        serializer = ProductListSerializer(
            result_page, 
            many=True, 
            context={'request': request}
        )
        
        # 6. Trả về
        return paginator.get_paginated_response(serializer.data)

    @property
    def paginator(self):
        """
        Khởi tạo paginator instance từ class định nghĩa trong settings.
        """
        if not hasattr(self, '_paginator'):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator

    from rest_framework.pagination import PageNumberPagination
    pagination_class = PageNumberPagination
    


class ProductDetailAPIView(APIView):
    permission_classes = [] 

    def get(self, request, pk):
        try:
            product = Product.objects.prefetch_related('images', 'variants').get(pk=pk) # Tối ưu SQL bằng prefetch_related
            serializer = ProductDetailSerializer(product, context={'request': request})
            response_data = serializer.data

            variants = response_data.get('variants', [])
            
            # Sử dụng set để lấy các giá trị duy nhất và loại bỏ giá trị trống
            versions = sorted(list(set(v.get('version') for v in variants if v.get('version'))))
            colors = sorted(list(set(v.get('color') for v in variants if v.get('color'))))

            response_data['options'] = {
                "version": versions if versions else None,
                "color": colors if colors else None
            }
            # --------------------------------

            return Response(response_data, status=status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy sản phẩm này."}, 
                status=status.HTTP_404_NOT_FOUND
            )