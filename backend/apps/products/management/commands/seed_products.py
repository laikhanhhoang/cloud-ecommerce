import uuid
import random, itertools
from django.core.management.base import BaseCommand
from apps.products.models import Product, ProductImage, ProductVariant
from django.core.files.base import ContentFile

class Command(BaseCommand):
    help = 'Seed dữ liệu sản phẩm mẫu'

    def handle(self, *args, **kwargs):
        Product.objects.all().delete()

        self.stdout.write("Đang khởi tạo dữ liệu mẫu...")

        # Danh sách tên sản phẩm mẫu
        product_names = ['Test product 1', 'Test product 2', 'Test product 3']

        for name in product_names:
            # 1. Tạo Product
            product = Product.objects.create(
                name=name,
                base_price=random.randint(10000, 50000), # Chỉnh lại giá cho giống VNĐ tí
                description=f"Đây là mô tả mẫu cho {name}"
            )
            
            self.stdout.write(self.style.HTTP_INFO(f"-> Đã tạo Product [ID: {product.id}]: {product.name}"))

            # 2. Tạo 3 ProductImage và lưu vào một danh sách để dùng sau
            product_images = []
            for i in range(3):
                is_main = (i == 0)
                img = ProductImage.objects.create(
                    product=product,
                    is_main=is_main,
                    image=ContentFile(b"fake_image_content", name=f"{uuid.uuid4()}.jpg")
                )
                product_images.append(img) # Lưu object ảnh vào list

            # 3. Tạo các ProductVariant
            versions = ["Standard", "Pro", "Limited"]
            colors = ['Black', 'Titanium', 'Silver', 'Gold']

            all_possible_variants = list(itertools.product(versions, colors))
            random.shuffle(all_possible_variants)

            for i in range(3):
                v_name, c_name = all_possible_variants[i]
                
                # Bốc ngẫu nhiên 1 object ảnh từ danh sách product_images phía trên
                chosen_image = random.choice(product_images)

                ProductVariant.objects.create(
                    product=product,
                    # SKU sẽ tự tạo trong hàm save() của model nên không cần truyền ở đây
                    version=v_name,
                    color=c_name,
                    price=product.base_price + random.randint(5000, 20000),
                    stock=random.randint(1, 50),
                    variant_image=chosen_image  # Gán ảnh ngẫu nhiên ở đây
                )

                self.stdout.write(f"      + Variant {v_name} - {c_name}: Dùng ảnh ID {chosen_image.id}")
                
            self.stdout.write(self.style.SUCCESS(f"   Đã tạo xong variants và gán ảnh cho: {name}"))

        self.stdout.write(self.style.SUCCESS('--- SEED DỮ LIỆU THÀNH CÔNG ---'))