# Cart & Order APIs (Spec cho Frontend + AI Agent)

Tài liệu này mô tả chi tiết các API **giỏ hàng (cart)** dựa trên thiết kế DB hiện tại: cart được lưu chung trong bảng `orders` với `status = in_cart`.

---

## Base URL
- Prefix: `/api/`

---

## Xác thực
- Tất cả endpoints trong tài liệu này **yêu cầu đăng nhập**.
- Backend đọc JWT theo thứ tự:
  1) Cookie `access_token`
  2) Header `Authorization: Bearer <token>`

Nếu chưa đăng nhập: trả `401 Unauthorized`.

### Error response format (quan trọng)
Project dùng `utils.custom_exception_handler.custom_exception_handler`, nên **mọi lỗi DRF** (401/400/404/...) đều được bọc dạng:

```json
{
  "error": {
    "status_code": 400,
    "message": "Bad Request",
    "details": {
      "field": ["msg"]
    }
  }
}
```

Ghi chú:
- `message` là mô tả theo HTTP status (vd: `Unauthorized`, `Not Found`, ...).
- `details` là payload gốc từ DRF (vd: `{"detail": "..."}` hoặc lỗi field-level).

Ví dụ `401` (chưa đăng nhập):
```json
{
  "error": {
    "status_code": 401,
    "message": "Unauthorized",
    "details": {
      "detail": "Authentication credentials were not provided."
    }
  }
}
```

---

## Data model mapping (tóm tắt)

### Cart (Order)
- `Order.status = "in_cart"` nghĩa là giỏ hàng.
- Một user **chỉ có 1 cart active** (enforce bằng code).

### Cart item (OrderItem)
- Một item đại diện cho 1 `ProductVariant` trong cart.
- `unit_price` có 2 quy tắc theo status của Order:
  - Với `Order.status = "in_cart"`: `unit_price` **cập nhật theo giá mới** của `ProductVariant.price`.
  - Với các status khác (pending/processing/...): `unit_price` là **snapshot tại thời điểm thanh toán** (checkout chưa nằm trong scope hiện tại).

---

## Quy ước tính toán

### `cart_count`
- `cart_count = sum(quantity)` trên tất cả `OrderItem` trong cart.
- Không phải số dòng item.

### `total_amount`
- `total_amount = sum(unit_price * quantity)`.

---

## Quy ước hành vi quan trọng

1) **GET cart**
- Không auto-create cart nếu chưa tồn tại.
- Nếu chưa có cart: trả về **thông báo** (frontend tự hiển thị “giỏ hàng trống”).

2) **POST add item**
- Nếu chưa có cart `in_cart`: **tạo Order mới** với:
  - `status = in_cart`
  - `total_amount = 0` (rồi recalc lại)
  - `full_name/phone_number/shipping_address/payment_method = null`

3) **Add item khi đã tồn tại**
- Nếu item đã tồn tại (cùng `product_variant_id`): **cộng dồn quantity**.

4) **Update quantity**
- Không cho phép `quantity = 0` (muốn xóa item thì dùng `DELETE`).

5) **Cart rỗng**
- Nếu cart rỗng sau khi xóa item: **vẫn giữ Order** (set `total_amount = 0`).

6) Stock validation (khuyến nghị)
- Không cho add/update vượt `ProductVariant.stock`.

> Nếu bạn muốn bỏ stock validation, cần ghi rõ trong code + docs.

---

## Response schema đề xuất

### Cart object
```json
{
  "id": 12,
  "status": "in_cart",
  "total_amount": "25000000.00",
  "full_name": null,
  "phone_number": null,
  "shipping_address": null,
  "payment_method": null,
  "cart_count": 2,
  "items": [
    {
      "id": 55,
      "product_variant": {
        "id": 100,
        "sku": "IPHONE-ABC123",
        "price": "25000000",
        "version": "2024",
        "color": "Black",
        "stock": 12,
        "product": {
          "id": 1,
          "name": "iPhone 15",
          "main_image": "http://localhost:8000/media/products/gallery/xxx.jpg"
        }
      },
      "quantity": 2,
      "unit_price": "25000000.00",
      "line_total": "50000000.00"
    }
  ]
}
```

Ghi chú:
- `price` trong `product_variant` là giá hiện tại của variant.
- `unit_price`:
  - Với cart (`status=in_cart`): cập nhật theo giá mới.
  - Với các order status khác: snapshot tại thời điểm thanh toán.
- `line_total` là field computed trong serializer.
- `main_image`:
  - Có thể là `null` nếu không có ảnh main.
  - Backend thường trả **absolute URL** (dùng `request.build_absolute_uri(...)`).

---

## 1) GET /api/cart/

### Mục đích
- Lấy thông tin chi tiết giỏ hàng hiện tại của user.

### Input
- Không có body.

### Output (200)

#### Trường hợp có cart
- Trả `Cart object` như schema.

Ghi chú implementation:
- Backend có thể **sync `unit_price` và `total_amount` theo giá mới** (rule `status=in_cart`) ngay khi GET cart để đảm bảo response luôn phản ánh giá hiện tại.

#### Trường hợp chưa có cart
Trả về thông báo (HTTP 200):
```json
{
  "message": "Người dùng chưa có cart."
}
```

---

## 2) GET /api/cart/count/

### Mục đích
- Lấy tổng số lượng sản phẩm trong giỏ để hiển thị badge trên navbar.

### Input
- Không có body.

### Output (200)
```json
{
  "count": 3
}
```

Ghi chú:
- Nếu user **chưa có cart**: backend trả `200` với `{"count": 0}`.

---

## 3) POST /api/cart/items/

### Mục đích
- Thêm 1 `ProductVariant` vào giỏ.

### Input (JSON)
```json
{
  "product_variant_id": 100,
  "quantity": 1
}
```

- `quantity` optional, default = 1.

### Behavior
- Nếu chưa có cart `in_cart`: tạo mới.
- Nếu item đã tồn tại (cùng `product_variant_id`): **cộng dồn quantity**.

### Output (200)
Backend hiện trả:
```json
{
  "message": "Đã thêm sản phẩm vào giỏ hàng.",
  "data": { /* Cart object */ }
}
```

### Errors
- `404 Not Found`: variant không tồn tại.
- `400 Bad Request`: quantity không hợp lệ, hoặc vượt stock.

Ví dụ lỗi (wrapped):
```json
{
  "error": {
    "status_code": 400,
    "message": "Bad Request",
    "details": {
      "quantity": ["Số lượng vượt quá tồn kho."]
    }
  }
}
```

---

## 4) PATCH /api/cart/items/{item_id}/

### Mục đích
- Cập nhật số lượng của 1 item trong cart.

### Input (JSON)
```json
{
  "quantity": 3
}
```

### Behavior
- `quantity` phải >= 1.
- Validate item thuộc về cart của user hiện tại.
- Không cho phép update về `0`.

### Output (200)
```json
{
  "message": "Đã cập nhật số lượng.",
  "data": { /* Cart object */ }
}
```

### Errors
- `404 Not Found`: item không tồn tại hoặc không thuộc user.
- `400 Bad Request`: quantity invalid hoặc vượt stock.

Ghi chú:
- `quantity=0` sẽ bị reject (min = 1) và trả `400`.

---

## 5) DELETE /api/cart/items/{item_id}/

### Mục đích
- Xóa một item khỏi cart.

### Input
- Không có body.

### Behavior
- Xóa item.
- Recalculate `total_amount`.
- Nếu cart rỗng sau khi xóa:
  - Giữ Order (total_amount=0).

### Output (200)
```json
{
  "message": "Đã xóa sản phẩm khỏi giỏ hàng.",
  "data": { /* Cart object */ }
}
```

### Errors
- `404 Not Found`: item không tồn tại hoặc không thuộc user.

Ví dụ lỗi `404` (wrapped):
```json
{
  "error": {
    "status_code": 404,
    "message": "Not Found",
    "details": {
      "detail": "Item không tồn tại hoặc không thuộc người dùng."
    }
  }
}
```

---

## URL routing đề xuất

Trong `apps/orders/urls.py` (dưới prefix `/api/` từ `config/urls.py`):
- `cart/` → GET
- `cart/count/` → GET
- `cart/items/` → POST
- `cart/items/<int:item_id>/` → PATCH, DELETE

---

## Middleware/permission cần dùng
- Dùng default auth/permission của project:
  - Authentication: `apps.authentication.authenticate.CustomJWTAuthentication`
  - Permission: `IsAuthenticated`

Không cần middleware riêng cho cart.

---

## Gợi ý tối ưu truy vấn (implementation note)
- Cart detail nên dùng:
  - `Order.objects.select_related('user').prefetch_related(...)`
  - Prefetch items/variants/products:
    - `items__product_variant`
    - `items__product_variant__product`
  - Prefetch ảnh main của product để tránh N+1 khi build `main_image`:
    - `Prefetch('items__product_variant__product__images', queryset=ProductImage.objects.filter(is_main=True), to_attr='main_image_list')`
