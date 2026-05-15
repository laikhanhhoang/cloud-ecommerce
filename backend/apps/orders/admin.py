# apps/orders/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    # Không cho phép sửa thông tin sản phẩm đã mua để bảo vệ Snapshot
    readonly_fields = (
        'product_variant', 'product_name', 'variant_version', 
        'color', 'unit_price', 'quantity', 'subtotal_display', 'image_preview'
    )
    fields = (
        'image_preview', 'product_name', 'variant_version', 
        'color', 'unit_price', 'quantity', 'subtotal_display'
    )

    def subtotal_display(self, obj):
        if obj.unit_price and obj.quantity:
            return format_html("<b>{:,} VNĐ</b>", obj.subtotal)
        return "-"
    subtotal_display.short_description = "Thành tiền"

    def image_preview(self, obj):
        if obj.product_main_image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />', obj.product_main_image)
        return "-"
    image_preview.short_description = "Ảnh"

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_link', 'status_badge', 'payment_method', 
        'formatted_total', 'created_at'
    )
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('id', 'user__username', 'full_name', 'phone_number')
    
    # Gom nhóm thông tin cho dễ nhìn
    fieldsets = (
        ("Thông tin đơn hàng", {
            'fields': ('status', 'payment_method', 'total_amount', 'order_note')
        }),
        ("Thông tin giao hàng (Snapshot)", {
            'fields': ('full_name', 'phone_number', 'shipping_address'),
        }),
        ("Dữ liệu hệ thống", {
            'fields': ('user', 'created_at', 'updated_at'),
            'classes': ('collapse',), # Ẩn bớt cho gọn
        }),
    )
    
    readonly_fields = ('total_amount', 'user', 'created_at', 'updated_at')
    inlines = [OrderItemInline]

    def user_link(self, obj):
        return obj.user.username
    user_link.short_description = "Khách hàng"

    def formatted_total(self, obj):
            # Ép kiểu sang float trước khi định dạng để đảm bảo không bị lỗi 's' (string)
            try:
                value = float(obj.total_amount)
                return format_html("<b>{:,.0f} VNĐ</b>", value)
            except (TypeError, ValueError):
                return "0 VNĐ"
            
    formatted_total.short_description = "Tổng tiền"

    def status_badge(self, obj):
        # Tạo màu sắc cho từng trạng thái cho dễ quản lý
        colors = {
            Order.Status.PENDING: "#f39c12",    # Cam
            Order.Status.PROCESSING: "#3498db", # Xanh dương
            Order.Status.SHIPPED: "#9b59b6",    # Tím
            Order.Status.DELIVERED: "#2ecc71",  # Xanh lá
            Order.Status.CANCELLED: "#e74c3c",  # Đỏ
        }
        color = colors.get(obj.status, "#7f8c8d")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 10px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Trạng thái"

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'product_name', 'quantity', 'unit_price')
    readonly_fields = [f.name for f in OrderItem._meta.fields] # Readonly toàn bộ field