# apps/orders/models.py
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from apps.products.models import ProductVariant

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING     = "pending", "Chờ thanh toán"
        PROCESSING  = "processing", "Đã thanh toán - Đơn hàng đang được xử lý"
        SHIPPED     = "shipped", "Đang giao hàng"
        DELIVERED   = "delivered", "Đã giao hàng"
        CANCELLED   = "cancelled", "Đã hủy"
    
    status              = models.CharField(max_length=20, choices=Status.choices,default=Status.PENDING,verbose_name="Trạng thái")


    class PaymentMethod(models.TextChoices):
        COD         = "cod", "Thanh toán khi nhận hàng (COD)"
        PAYOS       = "payos", "Thanh toán qua PayOS"

    payment_method      = models.CharField(max_length=10, choices=PaymentMethod.choices,default=PaymentMethod.COD, verbose_name="Phương thức thanh toán")

    user                = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.PROTECT,  related_name="orders",verbose_name="Khách hàng")

    # THÔNG TIN SNAPSHOT (Lưu tại thời điểm mua)
    full_name           = models.CharField(max_length=255, blank=True, verbose_name="Họ tên người nhận")
    phone_number        = models.CharField(max_length=20, verbose_name="Số điện thoại")
    shipping_address    = models.TextField(verbose_name="Địa chỉ giao hàng")
    total_amount        = models.DecimalField(max_digits=12, decimal_places=0, validators=[MinValueValidator(0)], verbose_name="Tổng tiền đơn hàng")
    order_note          = models.TextField(blank=True, null=True, verbose_name="Ghi chú đơn hàng")

    created_at          = models.DateTimeField(auto_now_add=True, verbose_name="Ngày đặt hàng")
    updated_at          = models.DateTimeField(auto_now=True)

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
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)

    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=0)

    # SNAPSHOT
    product_name = models.CharField(max_length=255, default="")
    variant_version = models.CharField(max_length=255, default="")
    color = models.CharField(max_length=100, null=True, blank=True)
    product_main_image = models.URLField(null=True, blank=True)

    class Meta:
        db_table = "order_items"

    def __str__(self):
        return f"Item {self.id} của Đơn hàng #{self.order.id}"

    @property
    def subtotal(self):
        return self.quantity * self.unit_price