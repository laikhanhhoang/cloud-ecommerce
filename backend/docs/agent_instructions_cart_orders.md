# Instructions cho AI Agent — Cart & Orders (Django/DRF)

Tài liệu này là **source of truth** để AI agent đọc và implement các API liên quan **giỏ hàng (cart)** và **đơn hàng (orders)** trong project hiện tại.

> Mục tiêu: AI agent có thể code đúng yêu cầu, đúng tech stack, đúng conventions trong repo, và hoàn thành theo kiểu end-to-end (code → test → fix → done).

---

## 1) Tech stack & kiến trúc hiện tại

### Backend
- Django `5.2.x`
- Django REST Framework `3.17.x`
- DB: PostgreSQL (`psycopg2`)

### Auth
- JWT (SimpleJWT) nhưng **CustomJWTAuthentication** ưu tiên đọc `access_token` từ **Cookie**.
- Header `Authorization: Bearer <token>` vẫn hoạt động (hữu ích cho Postman/mobile).
- Default permission toàn project: `IsAuthenticated` (trừ các endpoint tự set `permission_classes = []`).

### Error format
- `REST_FRAMEWORK.EXCEPTION_HANDLER` trỏ đến `utils.custom_exception_handler.custom_exception_handler`.
- Khi raise exception DRF đúng cách, response lỗi sẽ được bọc dạng:

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

> Quy ước: ưu tiên dùng `serializer.is_valid(raise_exception=True)` và raise `ValidationError/NotFound/PermissionDenied/...` để được bọc lỗi tự động.

---

## 2) Các module & cách tổ chức code hiện tại

- `config/urls.py` include các app theo prefix `/api/`.
- `apps/products/` đang dùng `APIView` + `serializers.ModelSerializer`.
- `apps/users/` dùng `generics.GenericAPIView`.

`apps/orders/` hiện đã có đầy đủ:
- `apps/orders/urls.py` (routes dưới `/api/`)
- `apps/orders/views.py` (Cart endpoints)
- `apps/orders/serializers.py` (input/output serializers)
- `apps/orders/services/cart.py` (service layer cho cart logic + recalc)
- `apps/orders/tests.py` (regression tests cho cart APIs)

### Conventions nên bám theo
- View: dùng `APIView` hoặc `GenericAPIView` (không bắt buộc ViewSet).
- Response: dùng `rest_framework.response.Response`.
- Không hard-code auth/permission toàn cục trong view nếu không cần (đã có default).

---

## 3) Domain rules: Cart được lưu trong bảng Orders

### Mapping
- “Cart” trong hệ thống = **một bản ghi `Order` có `status = in_cart`**.
- Item trong cart = bản ghi `OrderItem` thuộc Order đó.

### Model hiện có (quan trọng)
- `Order.Status.IN_CART = "in_cart"`.
- `Order.total_amount`: Decimal (hiện `decimal_places=2`).
- `OrderItem.unit_price`: Decimal (hiện `decimal_places=2`).
- `ProductVariant.price`: Decimal (hiện `decimal_places=0`).

> Lưu ý về Decimal: DRF serialize Decimal → string. Tổng tiền có thể ra dạng "25000000.00". Không tự ý đổi schema trong scope này trừ khi roadmap có yêu cầu.

### Quy tắc tạo cart theo yêu cầu
Khi thêm hàng vào giỏ:
1. Kiểm tra user có `Order` nào `status=in_cart` chưa.
2. Nếu **chưa có**: tạo `Order(user=request.user, status=in_cart, total_amount=0)`.
   - `full_name`, `phone_number`, `shipping_address`, `payment_method` = `null` (blank/null đúng theo model).
3. Thêm hoặc cập nhật `OrderItem` tương ứng.
4. Cập nhật lại `Order.total_amount` theo toàn bộ items.

### Quy tắc “mỗi user tối đa 1 cart”
DB chưa có unique constraint cho (user, status=in_cart). Vì vậy phải enforce ở **application layer**:
- Khi truy vấn cart, luôn lấy `Order.objects.filter(user=user, status=IN_CART).order_by('-created_at').first()`.
- Khi tạo mới: bọc trong transaction để tránh race condition.

---

## 4) Yêu cầu nghiệp vụ cho Cart APIs (đúng theo mô tả user)

Agent phải implement các API:
1. Xem thông tin giỏ hàng của user
2. Xem số lượng hàng trong giỏ (để hiển thị badge trên navbar)
3. Thêm 1 `ProductVariant` vào giỏ
4. Sửa số lượng của 1 variant trong giỏ
5. Xóa 1 variant khỏi giỏ

**Các API đều yêu cầu đăng nhập** (dùng default `IsAuthenticated`).

### Các hành vi cần quyết định rõ (chốt trong spec)
- Nếu cart chưa tồn tại:
  - GET cart → **không auto-create Order**. Nếu chưa có cart: trả về **thông báo** (frontend tự hiển thị giỏ trống).
  - POST add item → **auto-create** order `in_cart`.
- Nếu item đã tồn tại trong cart:
  - POST add item → **cộng dồn quantity**.
- Nếu update quantity về 0:
  - **Không cho 0** ở endpoint update; muốn xóa thì dùng DELETE.
- Nếu cart không còn item sau DELETE:
  - **Giữ `Order`** (total_amount=0) để tránh tạo/xóa liên tục.

### Stock (khuyến nghị chuyên nghiệp)
Dù user chưa yêu cầu explicit, implementation chuẩn nên validate:
- Không cho add/update quantity > `ProductVariant.stock`.
- Nếu `stock == 0` thì trả 400.

Nếu product hết hàng, frontend sẽ nhận lỗi rõ ràng.

---

## 5) Guidelines triển khai (để agent code hiệu quả)

### 5.1. Transaction & concurrency
Các endpoint **write** (add/update/delete) nên:
- dùng `transaction.atomic()`
- lock cart row bằng `select_for_update()` khi lấy cart (nếu cart tồn tại) để tránh race condition khi nhiều request song song.

### 5.2. Tính lại total_amount (khuyến nghị)
Không cộng/trừ thủ công theo delta (dễ sai), thay vào đó:
- sau mỗi thay đổi, recompute:
  - `total_amount = sum(item.unit_price * item.quantity for item in order.items.all())`
- update bằng `Order.objects.filter(pk=order.pk).update(total_amount=total_amount)`.

### 5.3. unit_price snapshot
Quy tắc theo status của Order:
- Với `Order.status = in_cart`:
  - `unit_price` **luôn cập nhật theo giá hiện tại** của `ProductVariant.price` (áp dụng khi add/update/recalculate).
- Với các status khác (pending/processing/...):
  - `unit_price` là **snapshot tại thời điểm thanh toán** (checkout chưa nằm trong scope hiện tại).

### 5.4. Response shape
Project hiện đang có 2 kiểu response thành công:
- Kiểu data thuần (Product detail)
- Kiểu `{message, data}` (Profile patch)

Cho cart APIs, ưu tiên thống nhất:
- GET: nếu có cart thì trả object cart; nếu chưa có cart thì trả `{"message": "Người dùng chưa có cart."}`
- POST/PATCH/DELETE: trả `{ "message": "...", "data": <cart> }`

### 5.5. Validation
- Dùng Serializer cho input để hưởng lợi error format chuẩn.
- Quantity: int, `min_value=1`.

---

## 6) Testing & Definition of Done (DoD)

Mỗi task phải hoàn thành end-to-end:
- Code xong view/serializer/urls
- Add test cases tối thiểu cho happy path + 1-2 edge case quan trọng
- Run: `python manage.py test`
- Fix lỗi (nếu có)

Khuyến nghị dùng:
- `rest_framework.test.APIClient`
- `force_authenticate(user=...)` để tránh phải login thật trong unit test.

---

## 7) Các file agent nên tạo/sửa (gợi ý)

Trong `apps/orders/`:
- `serializers.py`
- `views.py`
- `urls.py`
- `tests.py`
- (tuỳ chọn) `utils.py` hoặc `services/cart.py` nếu muốn tách logic

Ngoài ra cần sửa:
- `config/urls.py` để include orders endpoints dưới `/api/`.

---

## 8) Notes quan trọng

- Không tạo model `Cart` mới (theo yêu cầu: cart dùng chung bảng orders).
- Không thay đổi auth flow/cookie behavior.
- Không đổi schema DB nếu không thật sự bắt buộc.
- Mọi đường dẫn API đều nằm dưới prefix `/api/`.
