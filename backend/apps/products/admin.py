from django.contrib import admin
from .models import Product, ProductImage, ProductVariant

# 1. Inline cho Hình ảnh: Cho phép thêm ảnh ngay trong trang Sản phẩm
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1 # Số lượng dòng trống hiện sẵn để thêm ảnh
    fields = ('image', 'is_main')

# 2. Inline cho Phiên bản: Cho phép thêm biến thể ngay trong trang Sản phẩm
class ProductVariantInline(admin.StackedInline):
    model = ProductVariant
    extra = 1
    # Dùng StackedInline vì Variant có nhiều trường, hiện theo hàng dọc sẽ dễ nhìn hơn
    fields = (('id','sku', 'version'), ('price', 'stock', 'color'), 'variant_image')
    readonly_fields = ('id','sku') # SKU tự sinh nên để readonly nếu bạn không muốn sửa tay

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Hiển thị danh sách sản phẩm bên ngoài
    list_display = ('name', 'brand', 'category', 'base_price', 'created_at', 'updated_at')
    # Cho phép tìm kiếm theo tên
    search_fields = ('name',)
    # Bộ lọc bên tay phải
    list_filter = ('created_at',)
    
    # Gắn 2 inline vào trang quản trị sản phẩm
    inlines = [ProductImageInline, ProductVariantInline]

    # Group các trường trong trang detail cho gọn
    fieldsets = (
        ("Thông tin cơ bản", {
            'fields': ('name', 'brand', 'category', 'description', 'base_price')
        }),
        ("Kỹ thuật & Dữ liệu", {
            'classes': ('collapse',), # Cho phép đóng/mở
            'fields': ('specs',),
        }),
    )

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('id', 'sku', 'product', 'price', 'stock', 'color')
    list_filter = ('product', 'color')
    search_fields = ('sku', 'product__name')
    readonly_fields = ('id', 'sku')

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'product', 'image', 'is_main')
    list_filter = ('is_main',)