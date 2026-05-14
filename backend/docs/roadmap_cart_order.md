# Roadmap triển khai Cart & Order APIs (Checklist cho AI Agent)

Hướng dẫn sử dụng:
- Mỗi task bắt đầu với ô trống `[ ]`.
- Khi hoàn thành task (bao gồm code + test + fix lỗi), agent đổi thành `[x]`.
- Không đánh dấu hoàn thành nếu chưa chạy test tối thiểu cho phần vừa làm.

---

## Phase 1 — Khảo sát & chốt spec

- [x] Đọc models `Order`, `OrderItem`, `ProductVariant` và chốt các quyết định còn mơ hồ
  - Cần chốt rõ:
    - GET cart: không auto-create; nếu chưa có cart trả thông báo "Người dùng chưa có cart."
    - POST add item khi item đã tồn tại: cộng dồn quantity
    - Update quantity: không cho phép 0
    - Khi cart rỗng: vẫn giữ order (total_amount=0)
    - unit_price:
      - Với `status=in_cart`: cập nhật theo giá mới của variant
      - Với status khác: snapshot tại thời điểm thanh toán (chưa implement checkout)
  - DoD:
    - Cập nhật lại file spec API (tài liệu API) để phản ánh quyết định

---

## Phase 2 — Thiết kế serializer & response

- [x] Tạo serializers cho Cart
  - Output serializer (read): cart detail + items (gồm variant info tối thiểu)
  - Input serializers (write):
    - AddItemInput: `product_variant_id`, `quantity`
    - UpdateItemInput: `quantity`
  - DoD:
    - Serializers validate đúng: quantity >= 1, variant tồn tại
    - Error trả về đúng format (thông qua DRF exception handler)

---

## Phase 3 — Implement core cart logic (service/helper)

- [x] Tạo helper functions để đảm bảo logic nhất quán
  - Gợi ý hàm:
    - `get_or_create_cart(user)` (chỉ dùng cho write)
    - `get_cart(user)` (read, không auto-create nếu chưa có)
    - `recalculate_order_total(order)`
    - `get_cart_item(order, variant_id)`
  - Yêu cầu:
    - Dùng `transaction.atomic()` cho write flows
    - (Khuyến nghị) lock order bằng `select_for_update()`
  - DoD:
    - Logic được gọi lại từ views, không lặp code

---

## Phase 4 — Implement endpoints & routing

- [x] Tạo URL routes cho module orders/cart
  - Tạo `apps/orders/urls.py`
  - Thêm include vào `config/urls.py` với prefix `/api/`
  - DoD:
    - Các URL match đúng spec

- [x] GET Cart detail — xem thông tin giỏ hàng
  - Yêu cầu:
    - Auth required
    - Nếu chưa có cart: trả cart rỗng theo spec (không tạo order nếu spec chọn vậy)
  - DoD:
    - Test: user có cart và user chưa có cart

- [x] GET Cart count — xem tổng số lượng sản phẩm trong giỏ
  - Yêu cầu:
    - Trả sum(quantity)
    - Nhanh, query tối ưu
  - DoD:
    - Test: cart rỗng → 0; cart có items → đúng tổng

- [x] POST Add item — thêm product variant vào cart
  - Yêu cầu:
    - Nếu chưa có cart `in_cart` → tạo mới order `in_cart` với các field shipping/payment = null
    - Nếu item đã tồn tại → xử lý theo spec (khuyến nghị cộng dồn)
    - Validate stock theo spec (khuyến nghị)
    - Update `total_amount`
  - DoD:
    - Test: add lần đầu; add lần 2 cùng variant; vượt stock (nếu bật validation)

- [x] PATCH Update item quantity — sửa số lượng variant trong cart
  - Yêu cầu:
    - Xác định item theo `item_id` (khuyến nghị) hoặc theo `variant_id` (nếu spec chọn)
    - Validate quantity >= 1
    - Validate stock (nếu bật)
    - Update `total_amount`
  - DoD:
    - Test: update hợp lệ; update item không thuộc user → 404

- [x] DELETE Remove item — xóa variant khỏi cart
  - Yêu cầu:
    - Xác định item theo `item_id`
    - Update `total_amount`
    - Nếu cart rỗng: xử lý theo spec (giữ order hoặc delete)
  - DoD:
    - Test: delete hợp lệ; delete item không thuộc user → 404

---

## Phase 5 — Tests & regression

- [x] Viết test suite cho cart APIs
  - Dùng `APIClient` + `force_authenticate`
  - Coverage tối thiểu:
    - happy path cho tất cả endpoints
    - unauthenticated → 401
    - access item của user khác → 404
  - DoD:
    - `python manage.py test` pass

---

## Phase 6 — Sanity check & docs sync

- [x] Rà soát query performance & tính nhất quán response
  - Prefetch/select_related hợp lý cho cart detail
  - Không N+1 queries (ưu tiên `select_related('product_variant', 'product_variant__product')`)
  - DoD:
    - Review lại response examples trong docs, khớp code

- [x] Cập nhật docs API nếu có thay đổi trong quá trình implement
  - DoD:
    - Tài liệu API khớp behavior thực tế
