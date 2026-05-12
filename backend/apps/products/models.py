import uuid , os
from django.db import models
from django.db.models import Min
from django.db.models.signals import post_save, post_delete
from django.core.validators import MinValueValidator
from django.dispatch import receiver
from django.utils.text import slugify

def rename_image(instance, filename):
    ext = filename.split('.')[-1]                           # Lấy phần mở rộng của file cũ (ví dụ: .jpg, .png)
    new_filename = f"{uuid.uuid4()}.{ext}"                  # Tạo tên mới bằng UUID

    # Trả về đường dẫn đầy đủ bên trong thư mục media
    return os.path.join('products/gallery/', new_filename)

class Product(models.Model):
    # Các trường cơ bản của sản phẩm
    name = models.CharField(
        max_length=255, 
        verbose_name="Tên sản phẩm"
    )

    category = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Danh mục"
    )

    brand = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Thương hiệu"
    )

    description = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Mô tả"
    )

    specs = models.JSONField(                               # Trường lưu trữ các thông số kỹ thuật dưới dạng JSON,
        blank=True, 
        null=True, 
        verbose_name="Thông số kỹ thuật"
    ) # ví dụ: {"CPU": "Intel i7", "RAM": "16GB"}

    base_price = models.DecimalField(max_digits=12, 
        decimal_places=0, 
        default=0,                                          # Để decimal_places=0 để hợp với VNĐ
        validators=[MinValueValidator(1000)],
        verbose_name="Giá cơ bản (Giá thấp nhất)"
    ) 
    
    # Thông tin khác
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        verbose_name = "Sản phẩm"
        verbose_name_plural = "Danh sách sản phẩm"

    def __str__(self):
        return self.name

    def update_base_price(self):
        """
        Logic tính toán lại giá thấp nhất từ các variant.
        Sử dụng .update() để ghi đè trực tiếp vào DB, tránh gọi hàm save() gây lặp vô hạn.
        """
        min_price = self.variants.aggregate(Min('price'))['price__min']
        new_price = min_price if min_price is not None else 0           # Nếu không có variant nào, giữ nguyên hoặc set về 0
        Product.objects.filter(pk=self.pk).update(base_price=new_price) # Cập nhật trực tiếp xuống DB

    @property
    def main_image_url(self):
        img = self.images.filter(is_main=True).first()
        print(f"DEBUG: Main image for product '{self.name}' is: {img.image.url if img else 'None'}")  # Debug log
        return img.image.url if img else None

class ProductImage(models.Model):

    product = models.ForeignKey(
        Product, 
        related_name='images', 
        on_delete=models.CASCADE, 
        verbose_name="Sản phẩm"
    )
    image = models.ImageField(
        upload_to=rename_image, 
        verbose_name="Hình ảnh"
    )
    is_main = models.BooleanField(
        default=False,
        verbose_name="Hình ảnh chính"
    )

    class Meta:
        db_table = "product_images"
        verbose_name = "Hình ảnh sản phẩm"
        verbose_name_plural = "Thư viện ảnh sản phẩm"
        ordering = ['-is_main', 'id']

    def __str__(self):
        return f"Image {'main' if self.is_main else 'sub'} for {self.product.name} - {self.id}"

    def save(self, *args, **kwargs):
            if self.is_main: # Nếu đã có ảnh main thì phải tắt chúng đi rồi mới set ảnh này thành main
                ProductImage.objects.filter(product=self.product, is_main=True).update(is_main=False)
            
            super().save(*args, **kwargs)

class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product, 
        related_name='variants', 
        on_delete=models.CASCADE, 
        verbose_name="Sản phẩm"
    )

    sku = models.CharField(
        max_length=100, 
        unique=True, 
        blank=True, 
        verbose_name="Mã phiên bản (SKU)"
    )

    price = models.DecimalField(                                         # Đồng nhất với Product dùng chO VNĐ
        max_digits=12, 
        decimal_places=0, 
        validators=[MinValueValidator(1000)],
        verbose_name="Giá",
    ) 
    
    
    version = models.CharField(                                         # Trường này để phân biệt các phiên bản khác nhau của cùng một sản phẩm, ví dụ: "Phiên bản 2024", "Phiên bản đặc biệt", "Phiên bản giới hạn", v.v.
        max_length=255, 
        verbose_name="Phiên bản khác nhau của sản phẩm"
    )

    color = models.CharField(                                           # Màu sắc của variant
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name="Màu sắc"
    )

    variant_image = models.ForeignKey(
        ProductImage, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='variant_images', 
        verbose_name="Ảnh phiên bản"
    )

    stock = models.PositiveIntegerField(
        default=0, 
        verbose_name="Số lượng tồn kho"
    )                                                                    # Quản lý tồn kho cho từng phiên bản

    class Meta:
        db_table = "product_variants"
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'color', 'version'], 
                name='unique_variant_per_product'
            )
        ]
        verbose_name = "Phiên bản sản phẩm"
        verbose_name_plural = "Các phiên bản sản phẩm"

    def __str__(self):
        return f"{self.product.name} - {self.sku}"
    
    def save(self, *args, **kwargs):
        if not self.sku:
            # Logic tạo SKU tự động: Tên sản phẩm + chuỗi ngẫu nhiên ngắn giúp chuyển "Cà Phê Muối" thành "ca-phe-muoi-g7n1"
            product_slug = slugify(self.product.name).upper()
            random_str = uuid.uuid4().hex[:6].upper()
            self.sku = f"{product_slug}-{random_str}"
        
        super().save(*args, **kwargs)


# --- SIGNALS ---
# Tự động cập nhật base_price của Product mỗi khi Variant có thay đổi

@receiver(post_save, sender=ProductVariant)
def update_product_price_on_save(sender, instance, **kwargs):
    """Cập nhật giá khi thêm hoặc sửa Variant"""
    instance.product.update_base_price()

@receiver(post_delete, sender=ProductVariant)
def update_product_price_on_delete(sender, instance, **kwargs):
    """Cập nhật giá khi xóa một Variant"""
    instance.product.update_base_price()
