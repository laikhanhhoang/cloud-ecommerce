# apps/carts/admin.py
from django.contrib import admin
from .models import Cart, CartItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    # Cho phép xem thông tin sản phẩm nhưng không cho sửa bừa bãi ở đây nếu muốn
    extra = 0  # Không hiện sẵn các dòng trống
    readonly_fields = ('subtotal',) # Hiện tổng tiền từng món để admin dễ xem
    fields = ('product_variant', 'quantity', 'subtotal')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_email', 'total_items', 'formatted_total_price', 'created_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('created_at', 'updated_at')
    
    # Đưa danh sách item vào trong trang chi tiết Cart
    inlines = [CartItemInline]

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email khách hàng'

    def total_items(self, obj):
        return obj.items.count()
    total_items.short_description = 'Số loại sản pockets'

    def formatted_total_price(self, obj):
        # Format số tiền cho dễ nhìn (ví dụ: 50,000)
        return f"{obj.total_price:,.0f} VNĐ"
    formatted_total_price.short_description = 'Tổng tiền tạm tính'

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'cart', 'product_variant', 'quantity', 'subtotal_display')
    list_filter = ('cart__user',)
    search_fields = ('product_variant__name', 'cart__user__email')

    def subtotal_display(self, obj):
        return f"{obj.subtotal:,.0f} VNĐ"
    subtotal_display.short_description = 'Thành tiền'