# API Contract (Mock Endpoints)

Hệ thống Frontend sẽ giao tiếp với dữ liệu thông qua thư mục `src/api/`. 
Hiện tại, các hàm trong này sẽ trả về Promise resolve ra Mock Data. Cấu trúc Response bắt buộc phải tuân theo JSON schemas dưới đây để đảm bảo việc thay thế bằng REST API thật sau này không làm vỡ UI Component.

## Base URL: `/api`

---

### 1. Lấy danh sách sản phẩm (Home, Search, Category)
- **Hàm tương ứng:** `fetchProducts(params)`
- **Query Parameters (Tùy chọn):**
  - `keyword` (string): Từ khóa tìm kiếm theo tên (icontains, không phân biệt hoa thường).
  - `category` (string): Lọc theo danh mục (icontains).
  - `brand` (string): Lọc theo thương hiệu (icontains).
  - `min_price` (number): Giá tối thiểu (>= `base_price`).
  - `max_price` (number): Giá tối đa (<= `base_price`).
  - `page` (int): Phân trang theo `PageNumberPagination`.
- **Response Format (200 OK):**
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
    }
  ]
}
```
- **Response Format (400 Bad Request):**
```json
{
  "min_price": ["A valid number is required."]
}
```
- **Notes:**
  - `base_price` là string vì backend trả về `DecimalField`.
  - `main_image` có thể `null`.

**Frontend Implementation Notes**
- Danh sach san pham phai lay tu `results[]` (khong co `data[]`).
- Can parse `base_price` (string) truoc khi format VND.
- Neu `main_image` null thi dung anh fallback.

### 2. Lấy chi tiết một sản phẩm
- **Hàm tương ứng:** `fetchProductById(id)`
- **Response Format (200 OK):**
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
- **Response Format (404 Not Found):**
```json
{ "error": "Không tìm thấy sản phẩm này." }
```
- **Notes:**
  - `images` được sắp xếp `is_main=true` trước.
  - `variants[*].variant_image` có thể `null`.
  - `options.version` và `options.color` có thể `null`.
  - `base_price` và `variants[*].price` là string.

**Frontend Implementation Notes**
- UI Product Detail phai hien:
  - Anh chinh + 1 hang thumbnails tu `images[]` (click thumbnail doi anh chinh).
  - Lua chon variant theo Phiên bản (version) va Màu sắc (color) dua tren `options` + `variants`.
  - Mac dinh chon 1 variant khi vao trang (uu tien variant dau tien hop le).
  - Cho phep user chon **doc lap** giua version va color (khong auto doi option con lai).
  - Khi khong tim thay variant khop cap (version, color) da chon: coi nhu chua chon duoc variant.
  - Khi chon variant:
    - Gia hien thi uu tien `variants[*].price` cua variant duoc chon, fallback `base_price`.
    - Anh chinh uu tien `selectedVariant.variant_image.image` neu co, fallback theo `images`/`main_image`.
  - KHONG hien thi cac truong noi bo cua variant len UI (vi du: `sku`, `stock`, `variant id`).
  - Hien thi Mô tả (`description`) va Bang thong so ky thuat (`specs`) o phan duoi; `specs` render dang table.
  - Neu `description/specs` null/empty thi an section (khong tu bịa noi dung).

### 3. Gửi đơn hàng (Checkout)
- **Hàm tương ứng:** `submitOrder(orderData)`
- **Request Body (orderData):**
```json
{
  "customer": {
    "fullName": "Nguyen Van A",
    "phone": "0901234567",
    "address": "123 Đường ABC, Phường X, Quận Y, TP Z"
  },
  "items": [
    {
      "productId": "prod_1",
      "quantity": 2,
      "price": 29000000
    }
  ],
  "totalAmount": 58000000
}
```
- **Response Format (200 OK):**
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "orderId": "ORD_123456"
}
```

### 4. Xác thực và Người Dùng (Auth & Profile)
- **Lưu ý:** Backend thật sử dụng HttpOnly Cookie cho JWT (Access Token + Refresh Token). Frontend Mock có thể giả lập hoặc cấu hình Axios để chuẩn bị gọi API thật. Đảm bảo cấu hình Axios theo format được quy định trong `api-auth-user.md` (bao gồm `withCredentials: true`, và Axios config cho xử lý refresh 401).
- **Hàm tương ứng:** 
  - `login(credentials)` -> POST `/api/auth/login/`
  - `register(userData)` -> POST `/api/auth/register/`
  - `logout()` -> POST `/api/auth/logout/`
  - `fetchCurrentUser()` -> GET `/api/auth/me/`
  - `refreshToken()` -> POST `/api/auth/token/refresh/`
  - `fetchProfile()` -> GET `/api/profile/me/`
  - `updateProfile(data)` -> PATCH `/api/profile/me/`

---

### 5. Giỏ hàng (Cart) — Backend-aligned

Phần Cart **phải** tuân theo spec backend trong `cart_order_api.md`.

**Quan trọng**
- Tất cả endpoints Cart **yêu cầu đăng nhập**.
- Lỗi DRF (401/400/404/...) dùng format bọc:

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

#### 5.1. Lấy cart hiện tại
- **Hàm tương ứng:** `fetchCart()` -> GET `/api/cart/`

**Response 200 (có cart)**
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

**Response 200 (chưa có cart)**
```json
{ "message": "Người dùng chưa có cart." }
```

**Frontend notes**
- `total_amount`, `unit_price`, `line_total` là decimal string ⇒ cần parse trước khi format VND.
- Không auto-create cart khi GET; frontend tự xử lý empty state.

#### 5.2. Lấy số lượng sản phẩm trong cart (badge)
- **Hàm tương ứng:** `fetchCartCount()` -> GET `/api/cart/count/`

**Response 200**
```json
{ "count": 3 }
```

Ghi chú: nếu user chưa có cart backend trả `200` với `{ "count": 0 }`.

#### 5.3. Thêm sản phẩm vào cart
- **Hàm tương ứng:** `addCartItem(payload)` -> POST `/api/cart/items/`

**Request**
```json
{ "product_variant_id": 100, "quantity": 1 }
```

**Response 200**
```json
{
  "message": "Đã thêm sản phẩm vào giỏ hàng.",
  "data": { /* Cart object */ }
}
```

Ghi chú:
- `quantity` optional, default = 1.
- Nếu chưa có cart `in_cart` backend sẽ tạo Order mới.
- Nếu item đã tồn tại (cùng `product_variant_id`) backend sẽ cộng dồn quantity.

#### 5.4. Cập nhật số lượng item
- **Hàm tương ứng:** `updateCartItemQuantity(itemId, payload)` -> PATCH `/api/cart/items/{item_id}/`

**Request**
```json
{ "quantity": 3 }
```

**Response 200**
```json
{
  "message": "Đã cập nhật số lượng.",
  "data": { /* Cart object */ }
}
```

Ghi chú:
- Không cho phép `quantity = 0` (muốn xóa dùng DELETE).

#### 5.5. Xóa item khỏi cart
- **Hàm tương ứng:** `removeCartItem(itemId)` -> DELETE `/api/cart/items/{item_id}/`

**Response 200**
```json
{
  "message": "Đã xóa sản phẩm khỏi giỏ hàng.",
  "data": { /* Cart object */ }
}
```