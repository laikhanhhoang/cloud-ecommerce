from rest_framework import serializers
from .models import Product, ProductImage, ProductVariant

# 1. Serializer cho Hình ảnh
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

# 2. Serializer cho các Phiên bản (Variant)
class ProductVariantSerializer(serializers.ModelSerializer):
    # Lấy thông tin ảnh của variant nếu có
    variant_image = ProductImageSerializer(read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'price', 'version', 
            'color', 'stock', 'variant_image'
        ]

# 3. ONLY-READ Serializer cho Danh sách sản phẩm (products/) chỉ hiện thông tin cơ bản để tối ưu tốc độ load
class ProductListSerializer(serializers.ModelSerializer):
    
    main_image = serializers.SerializerMethodField() # Lấy ảnh chính của sản phẩm

    class Meta:
        model = Product
        fields = ['id', 'name', 'base_price', 'main_image']

    def get_main_image(self, obj):
        url = obj.main_image_url # Gọi property từ model
        if url:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(url)
            return url # Trả về tương đối nếu không có request (ví dụ chạy trong shell)
        return None

# 4. Serializer cho Chi tiết sản phẩm (products/<id>/)
class ProductDetailSerializer(serializers.ModelSerializer):
    # Lồng danh sách ảnh và danh sách các phiên bản vào
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'category', 'description', 'specs', 
            'base_price', 'images', 'variants', 
            'created_at', 'updated_at'
        ]