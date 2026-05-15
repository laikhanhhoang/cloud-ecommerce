# Products API (Hướng dẫn cho Frontend)

Tài liệu này mô tả chi tiết các API thuộc module Products để frontend tích hợp.

## Base URL và Prefix

- Tất cả endpoints dưới prefix: `/api/`
- Media file (ảnh) được phát qua: `/media/`
- Khi gọi API từ HTTP request, backend có xử lý build absolute URL cho ảnh (nếu có `request`).

## Xác thực

- Các API Products hiện tại **không yêu cầu đăng nhập** (permission_classes = []).

## Phân trang

- Danh sách sử dụng `PageNumberPagination`
- Tham số:
  - `page` (int, optional): số trang
- Kích thước trang mặc định: 20 (từ `PAGE_SIZE`)
- Lưu ý: query param `page_size` hiện **không** được backend hỗ trợ
- `count/next/previous/results` theo chuẩn DRF PageNumberPagination

Response phân trang (mẫu DRF):

```json
{
  "count": 120,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "iPhone 15",
      "base_price": "25000000",
      "main_image": "http://localhost:8000/media/products/gallery/xxx.jpg"
    }
  ]
}
```

## 1) GET /api/products/

### Mục đích
- Lấy danh sách sản phẩm theo bộ lọc và phân trang.
- Trả về thông tin cơ bản để tối ưu tốc độ load.

### Query Parameters (Filters)
- `min_price` (number, optional): lọc giá từ (>= `base_price`)
- `max_price` (number, optional): lọc giá đến (<= `base_price`)
- `keyword` (string, optional): tìm theo tên (không phân biệt hoa thường, chứa chuỗi)
- `brand` (string, optional): lọc theo thương hiệu (icontains)
- `category` (string, optional): lọc theo danh mục (icontains)
- `page` (int, optional): trang

### Ordering
- Mặc định: mới nhất trước (`created_at` giảm dần)

### Input
- Không có body

### Output (200)
- Danh sách sản phẩm cơ bản:

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "iPhone 15",
      "base_price": "25000000",
      "main_image": "http://localhost:8000/media/products/gallery/xxx.jpg"
    },
    {
      "id": 2,
      "name": "MacBook Pro M3",
      "base_price": "45000000",
      "main_image": null
    }
  ]
}
```

### Output (400)
- Khi bộ lọc không hợp lệ (filterset errors):

```json
{
  "min_price": ["A valid number is required."]
}
```

### Ghi chú cho frontend
- `main_image` có thể `null` nếu sản phẩm chưa có ảnh main.
- `base_price` là string vì DRF trả DecimalField -> chuỗi.
- `base_price` là giá thấp nhất trong các variants; nếu sản phẩm chưa có variant thì sẽ trả về "0".

## 2) GET /api/products/{id}/

### Mục đích
- Lấy chi tiết sản phẩm, bao gồm thư viện ảnh và danh sách variants.
- Tự động build thêm trường `options` để render UI chọn version/color.

### Input
- Path param: `id` (int)

### Output (200)

```json
{
  "id": 1,
  "name": "iPhone 15",
  "brand": "Apple",
  "category": "Smartphone",
  "description": "Mô tả...",
  "specs": {
    "CPU": "A17",
    "RAM": "8GB"
  },
  "base_price": "25000000",
  "images": [
    {
      "id": 10,
      "image": "http://localhost:8000/media/products/gallery/aaa.jpg",
      "is_main": true
    },
    {
      "id": 11,
      "image": "http://localhost:8000/media/products/gallery/bbb.jpg",
      "is_main": false
    }
  ],
  "variants": [
    {
      "id": 100,
      "sku": "IPHONE-ABC123",
      "price": "25000000",
      "version": "2024",
      "color": "Black",
      "stock": 12,
      "variant_image": {
        "id": 10,
        "image": "http://localhost:8000/media/products/gallery/aaa.jpg",
        "is_main": true
      }
    }
  ],
  "created_at": "2026-05-13T10:00:00+07:00",
  "updated_at": "2026-05-13T12:00:00+07:00",
  "options": {
    "version": ["2024"],
    "color": ["Black"]
  }
}
```

### Output (404)

```json
{
  "error": "Không tìm thấy sản phẩm này."
}
```

### Ghi chú cho frontend
- `images` sắp xếp theo `is_main` trước (ordering trong model).
- `variants` mỗi item có `variant_image` (có thể `null` nếu chưa set).
- `options.version` và `options.color` sẽ là `null` nếu không có dữ liệu.
- `specs` là JSON object linh hoạt, frontend nên render động.
- `price` là string vì DRF trả DecimalField -> chuỗi.
- Thứ tự `variants` không được đảm bảo (không có ordering trong model).

## Định nghĩa trường dữ liệu

### Product (list)
- `id` (int)
- `name` (string)
- `base_price` (string, VNĐ)
- `main_image` (string | null): URL ảnh main

### Product (detail)
- `id` (int)
- `name` (string)
- `brand` (string | null)
- `category` (string | null)
- `description` (string | null)
- `specs` (object | null)
- `base_price` (string)
- `images` (array of ProductImage)
- `variants` (array of ProductVariant)
- `created_at` (datetime string)
- `updated_at` (datetime string)
- `options` (object)
  - `version` (array of string | null)
  - `color` (array of string | null)

### ProductImage
- `id` (int)
- `image` (string): URL
- `is_main` (boolean)

### ProductVariant
- `id` (int)
- `sku` (string)
- `price` (string, VNĐ)
- `version` (string)
- `color` (string | null)
- `stock` (int)
- `variant_image` (ProductImage | null)

## Ví dụ gọi API nhanh

- List: `/api/products/?keyword=iphone&min_price=10000000&page=1`
- Detail: `/api/products/1/`
