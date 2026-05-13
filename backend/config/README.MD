
# FILE: config/custom_storages.py


```python
from storages.backends.s3 import S3Storage


class StaticStorage(S3Storage):
    """
    Storage dành cho static files:
    - admin css/js
    - frontend build assets
    - fonts/icons
    """

    location = "static"
    default_acl = None
    file_overwrite = True


class MediaStorage(S3Storage):
    """
    Storage dành cho user-uploaded files:
    - product images
    - avatars
    - attachments
    """

    location = "media"
    default_acl = None
    file_overwrite = False

```
---

# FILE: config/settings.py


```python
import os

# ============================================================
# AWS / S3 CONFIG
# ============================================================

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME")

AWS_S3_REGION_NAME = "ap-southeast-1"

# ------------------------------------------------------------
# S3 API endpoint
# Backend SDK (boto3) dùng endpoint này để:
# - upload
# - download
# - delete
# - list object
# ------------------------------------------------------------

if DEBUG:
    # Local MinIO
    AWS_S3_ENDPOINT_URL = "http://localhost:9000"

    AWS_S3_USE_SSL = False
    AWS_S3_VERIFY = False

else:
    # AWS thật -> boto3 tự resolve endpoint
    AWS_S3_ENDPOINT_URL = None


# ============================================================
# PUBLIC DOMAIN FOR GENERATED URLS
# ============================================================

# Có thể thay bằng CloudFront domain:
# dxxxxxxxx.cloudfront.net

AWS_S3_CUSTOM_DOMAIN = (
    f"{AWS_STORAGE_BUCKET_NAME}.s3."
    f"{AWS_S3_REGION_NAME}.amazonaws.com"
)

# ============================================================
# ACL / SECURITY
# ============================================================

# AWS hiện đại thường block ACL public
# nên dùng bucket policy / CloudFront thay vì ACL

AWS_DEFAULT_ACL = None

# False:
# -> URL public cố định
# -> CDN cache tốt hơn
# -> serializer stable URL

AWS_QUERYSTRING_AUTH = False

# ============================================================
# CACHE CONTROL
# ============================================================

AWS_S3_OBJECT_PARAMETERS = {
    "CacheControl": "max-age=86400",
}

# ============================================================
# DJANGO STORAGES
# ============================================================

STORAGES = {
    # User uploaded files
    "default": {
        "BACKEND": "config.custom_storages.MediaStorage",
    },

    # collectstatic output
    "staticfiles": {
        "BACKEND": "config.custom_storages.StaticStorage",
    },
}

# ============================================================
# STATIC FILES
# ============================================================

STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"

# ============================================================
# MEDIA FILES
# ============================================================

MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"

```
---

# FILE: your_app/models.py

```python
from django.db import models


class Product(models.Model):

    name = models.CharField(max_length=255)

    @property
    def main_image_url(self):

        img = self.images.filter(is_main=True).first()

        return img.image.url if (img and img.image) else None


class ProductImage(models.Model):

    product = models.ForeignKey(
        Product,
        related_name="images",
        on_delete=models.CASCADE,
    )

    image = models.ImageField(
        upload_to="products/%Y/%m/"
    )

    is_main = models.BooleanField(default=False)

```
---



# FILE: your_app/serializers.py

```python
from rest_framework import serializers

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductImage

        fields = [
            "id",
            "image",
            "is_main",
        ]


class ProductSerializer(serializers.ModelSerializer):

    images = ProductImageSerializer(
        many=True,
        read_only=True,
    )

    main_image_url = serializers.ReadOnlyField()

    class Meta:
        model = Product

        fields = [
            "id",
            "name",
            "main_image_url",
            "images",
        ]

```
---


# FILE: your_app/views.py

```python
from django.db.models import Prefetch
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Product, ProductImage
from .serializers import ProductSerializer


class ProductViewSet(ReadOnlyModelViewSet):

    serializer_class = ProductSerializer

    queryset = (
        Product.objects
        .prefetch_related(
            Prefetch(
                "images",
                queryset=ProductImage.objects.only(
                    "id",
                    "product_id",
                    "image",
                    "is_main",
                )
            )
        )
    )
```