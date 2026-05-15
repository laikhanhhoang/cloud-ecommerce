# Cart & Order APIs (Spec cho Frontend + AI Agent)

Tài liệu này mô tả chi tiết các API **giỏ hàng (cart)** và **đơn hàng (order)** dựa trên thiết kế DB hiện tại.

---

## Base URL
- Prefix: `/api/`

---

## Xác thực
- Tất cả endpoints trong tài liệu này **yêu cầu đăng nhập**.
- Lỗi DRF được bọc theo format (nếu áp dụng custom_exception_handler):
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

## 1. Giỏ hàng (Cart) API

### Data model mapping
- Cart hiện tại là một model riêng biệt (`Cart`), mỗi user có 1 cart.
- `CartItem` lưu thông tin số lượng (`quantity`) và `ProductVariant`.

### 1.1. Lấy chi tiết giỏ hàng
- **Endpoint**: `GET /api/carts/`
- **Mục đích**: Lấy thông tin chi tiết giỏ hàng hiện tại của user.
- **Output (200)**:
```json
{
  "id": 1,
  "total_amount": 50000000,
  "cart_count": 2,
  "items": [
    {
      "id": 10,
      "product_name": "iPhone 15",
      "product_variant": {
        "id": 100,
        "sku": "IPHONE-ABC123",
        "price": "25000000",
        "version": "2024",
        "color": "Black",
        "stock": 12
      },
      "quantity": 2,
      "unit_price": 25000000,
      "line_total": 50000000,
      "thumbnail": "http://localhost:8000/media/products/gallery/xxx.jpg"
    }
  ]
}
```
**Ghi chú**: Nếu user chưa có cart hoặc cart rỗng, API sẽ trả về (HTTP 200):
```json
{
  "id": null,
  "items": [],
  "total_amount": 0
}
```

### 1.2. Lấy số lượng sản phẩm trong giỏ (Cart Count)
- **Endpoint**: `GET /api/carts/count/`
- **Mục đích**: Lấy tổng số lượng dòng sản phẩm trong giỏ để hiển thị badge.
- **Output (200)**:
```json
{
  "cart_count": 2
}
```
**Ghi chú**: Key là `cart_count`, không phải `count`. Nếu chưa có cart trả về `0`.

### 1.3. Thêm sản phẩm vào giỏ
- **Endpoint**: `POST /api/carts/add/`
- **Input (JSON)**:
```json
{
  "product_variant_id": 100,
  "quantity": 2
}
```
- **Output (201 Created)**:
```json
{
  "message": "Đã thêm vào giỏ hàng"
}
```
**Ghi chú**: API sẽ tự động lấy hoặc tạo giỏ hàng cho user. Nếu `product_variant_id` đã có trong giỏ, số lượng sẽ được cộng dồn.

> **Lưu ý**: Hiện tại Backend **chưa cung cấp** các API để Cập nhật (PATCH) hay Xoá (DELETE) item lẻ trong giỏ hàng. Nếu cần, frontend phải chờ backend cập nhật thêm hoặc thực hiện work-around.

---

## 2. Đơn hàng (Order) API

### Data model mapping
- Model `Order` có các status: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.
- Payment method: `cod`, `payos`.

### 2.1. Tạo đơn hàng (Checkout)
- **Endpoint**: `POST /api/orders/create/`
- **Input (JSON)**:
```json
{
  "full_name": "Nguyen Van A",
  "phone_number": "0900000000",
  "shipping_address": "HCMC",
  "payment_method": "cod",
  "order_note": "Giao giờ hành chính",
  "items": [
    {
      "variant_id": 1,
      "quantity": 2
    },
    {
      "variant_id": 5,
      "quantity": 1
    }
  ]
}
```
- **Output (201 Created)**:
```json
{
  "full_name": "Nguyen Van A",
  "phone_number": "0900000000",
  "shipping_address": "HCMC",
  "payment_method": "cod",
  "order_note": "Giao giờ hành chính",
  "checkout_url": null
}
```
**Ghi chú**: 
- Danh sách `items` yêu cầu gửi kèm khi tạo đơn hàng (lấy từ dữ liệu giỏ hàng hiện tại).
- Backend sẽ kiểm tra stock và trừ stock của variant tương ứng.
- Nếu `payment_method` là `"payos"`, `checkout_url` sẽ trả về link thanh toán (URL) để Frontend redirect người dùng.

### 2.2. Lịch sử đơn hàng
- **Endpoint**: `GET /api/orders/history/`
- **Mục đích**: Lấy danh sách lịch sử đơn hàng có phân trang.
- **Output (200)**:
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "status": "pending",
      "payment_method": "cod",
      "total_amount": "50000000.00",
      "created_at": "2026-05-15T12:00:00Z"
    }
  ]
}
```

### 2.3. Chi tiết đơn hàng
- **Endpoint**: `GET /api/orders/<id>/`
- **Mục đích**: Lấy chi tiết một đơn hàng kèm danh sách sản phẩm.
- **Output (200)**:
```json
{
  "id": 1,
  "status": "pending",
  "payment_method": "cod",
  "total_amount": "50000000.00",
  "created_at": "2026-05-15T12:00:00Z",
  "updated_at": "2026-05-15T12:00:00Z",
  "full_name": "Nguyen Van A",
  "phone_number": "0900000000",
  "shipping_address": "HCMC",
  "order_note": "Giao giờ hành chính",
  "items": [
    {
      "id": 1,
      "product_name": "iPhone 15",
      "variant_version": "2024",
      "color": "Black",
      "product_main_image": "http://localhost:8000/media/products/gallery/xxx.jpg",
      "quantity": 2,
      "unit_price": "25000000.00",
      "subtotal": "50000000.00"
    }
  ]
}
```
