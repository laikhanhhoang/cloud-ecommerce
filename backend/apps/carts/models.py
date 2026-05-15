# apps/carts/models.py
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from apps.products.models import ProductVariant

class Cart(models.Model):
    # Mỗi User chỉ có duy nhất 1 giỏ hàng tại 1 thời điểm
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        verbose_name="Chủ sở hữu"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Ngày tạo")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Cập nhật cuối")

    class Meta:
        db_table = "carts"
        verbose_name = "Giỏ hàng"
        verbose_name_plural = "Giỏ hàng"

    def __str__(self):
        return f"Giỏ hàng của {self.user.username}"
    
    @property
    def total_price(self):
        """Tính tổng tiền tạm thời trong giỏ hàng"""
        return sum(item.subtotal for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Giỏ hàng"
    )
    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="cart_items",
        verbose_name="Sản phẩm biến thể"
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Số lượng"
    )

    class Meta:
        db_table = "cart_items"
        # Đảm bảo trong 1 giỏ hàng, 1 sản phẩm chỉ xuất hiện 1 dòng
        unique_together = ('cart', 'product_variant')

    def __str__(self):
        return f"{self.quantity} x {self.product_variant.name}"

    @property
    def subtotal(self):
        """Giá này lấy theo giá hiện tại của ProductVariant"""
        return self.quantity * self.product_variant.price