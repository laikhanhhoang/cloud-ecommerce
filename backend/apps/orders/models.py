# apps/orders/models.py
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from apps.products.models import ProductVariant

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Chờ thanh toán"
        PROCESSING = "processing", "Đã thanh toán - Đơn hàng đang được xử lý"
        SHIPPED = "shipped", "Đang giao hàng"
        DELIVERED = "delivered", "Đã giao hàng"
        CANCELLED = "cancelled", "Đã hủy"

    class PaymentMethod(models.TextChoices):
        COD = "cod", "Thanh toán khi nhận hàng (COD)"
        PAYOS = "payos", "Thanh toán qua PayOS"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,  
        related_name="orders",
        verbose_name="Khách hàng"
    )

    # THÔNG TIN SNAPSHOT (Lưu tại thời điểm mua)
    full_name = models.CharField(max_length=255, blank=True, verbose_name="Họ tên người nhận")
    phone_number = models.CharField(max_length=20, verbose_name="Số điện thoại")
    shipping_address = models.TextField(verbose_name="Địa chỉ giao hàng")
    
    # Tổng tiền thực tế khách phải trả (đã chốt)
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Tổng tiền đơn hàng"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Trạng thái"
    )

    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD,
        verbose_name="Phương thức thanh toán"
    )
    payment_link = models.URLField(
        max_length=500, 
        blank=True, 
        null=True, 
        verbose_name="Link thanh toán PayOS"
    )
    order_note = models.TextField(blank=True, null=True, verbose_name="Ghi chú đơn hàng")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đặt hàng")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ['-created_at']
        verbose_name = "Đơn hàng"
        verbose_name_plural = "Đơn hàng"

    def __str__(self):
        return f"Đơn hàng #{self.id} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        # Nếu full_name trống, lấy email của user gán qua
        if not self.full_name and self.user:
            self.full_name = self.user.email
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE, 
        related_name="items",
        verbose_name="Đơn hàng"
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items",
        verbose_name="Sản phẩm"
    )

    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Số lượng"
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Giá tại thời điểm mua"
    )

    class Meta:
        db_table = "order_items"

    def __str__(self):
        return f"Item {self.id} của Đơn hàng #{self.order.id}"

    @property
    def subtotal(self):
        return self.quantity * self.unit_price