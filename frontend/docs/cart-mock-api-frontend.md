# Frontend Cart — Kế hoạch migrate sang Backend Cart API

Ngày cập nhật: 2026-05-14

Phạm vi: tài liệu này mô tả **hiện trạng** (cart client-side bằng Zustand) và **đích đến** (cart server-side theo backend), để AI agent có thể migrate code theo roadmap.

Nguồn spec backend (source of truth): `cart_order_api.md`.

---

## 1) Backend Cart API (đã có) — tóm tắt cho frontend

Base prefix: `/api/`

### 1.1. Endpoints
- `GET /api/cart/`
  - Có cart: trả về `Cart object`
  - Chưa có cart: trả `200` với `{ "message": "Người dùng chưa có cart." }`
- `GET /api/cart/count/` → `{ "count": number }` (nếu chưa có cart vẫn trả 0)
- `POST /api/cart/items/` (add item theo `product_variant_id`, cộng dồn nếu đã tồn tại)
- `PATCH /api/cart/items/{item_id}/` (update quantity; không cho `quantity=0`)
- `DELETE /api/cart/items/{item_id}/` (xóa item)

### 1.2. Auth + Error wrapper
- Tất cả endpoints Cart **yêu cầu đăng nhập**.
- Lỗi DRF (401/400/404/...) được bọc theo format:

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

Gợi ý UI: khi lỗi stock, backend có thể trả `error.details.quantity`.

### 1.3. Field cần parse
- `total_amount`, `unit_price`, `line_total` là decimal string ⇒ parse sang number trước khi format tiền.

---

## 2) Hiện trạng frontend (legacy) — Cart client-side

Hiện tại repo vẫn có `useCartStore` để quản lý cart thuần client-side (không gọi `/api/cart/*`). Phần này được giữ làm tham chiếu để migrate.

**Nguồn code chính**
- `src/store/useCartStore.js`
- Cart UI: `src/pages/CartPage.jsx`, `src/components/layout/Header.jsx`

---

## 3) Target state (kỳ vọng sau migrate)

### 3.1. Source of truth
- Backend cart (`GET /api/cart/`) là source of truth cho CartPage.
- Header badge lấy từ `GET /api/cart/count/` (hoặc `cart.cart_count`) nhưng **phải** phản ánh vào Zustand để Header subscribe theo requirement.

### 3.2. Mapping: Backend cart → UI cần hiển thị

Backend trả về `items[]` với shape:

- `item.id` = `item_id` (dùng cho PATCH/DELETE)
- `item.product_variant.id` = `variantId`
- `item.product_variant.product.id` = `productId`
- `item.product_variant.product.name` = `name`
- `item.product_variant.product.main_image` = ảnh hiển thị (có thể `null`)
- `item.product_variant.version`, `item.product_variant.color` = text variant
- `item.unit_price`, `item.line_total` = decimal string

### 3.3. Empty cart
- Nếu `GET /api/cart/` trả `{ "message": "..." }` ⇒ UI hiển thị “Giỏ hàng trống” (không coi là error).

---

## 4) Checkout (lưu ý phạm vi)

Backend spec hiện tại tập trung vào Cart (`status=in_cart`). API “checkout/submit order” chưa được chuẩn hoá trong `cart_order_api.md`.

Trong lúc chờ endpoint order thật:
- Checkout có thể **tiếp tục mock** `submitOrder(orderData)`.
- Nếu muốn “dọn cart” sau khi checkout mock thành công, có thể xoá từng item bằng `DELETE /api/cart/items/{item_id}/` (từ data cart hiện tại).

Phần này **không phải contract hiện tại**, chỉ là gợi ý nếu muốn backend quản lý cart thật.

Các hướng phổ biến:
- `GET /api/cart/` => trả cart hiện tại
- `POST /api/cart/items/` => add item (productId, variantId?, quantity)
- `PATCH /api/cart/items/{cartItemId}/` => update quantity
- `DELETE /api/cart/items/{cartItemId}/` => remove

Frontend hiện tại sẽ cần:
- Tạo `src/api/cartApi.js` + hooks `useCartQuery/useAddCartItem/...`
- Đồng bộ `useCartStore` hoặc thay bằng server state.
