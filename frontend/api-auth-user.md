# API Contract (Frontend)

Tài liệu này mô tả các API hiện có của backend theo đúng codebase hiện tại.

## Base

- Base URL: `/{HOST}/api`
- Auth chính: JWT qua **HttpOnly Cookie**
  - `access_token` (15 phút), `refresh_token` (7 ngày, path `/api/auth/`)
- Fallback auth (Postman/mobile): Header `Authorization: Bearer <access_token>`
- Mặc định API yêu cầu đăng nhập, trừ các endpoint ghi rõ `AllowAny`.

## Error format

- Các lỗi dạng DRF exception (ví dụ `serializer.is_valid(raise_exception=True)`) sẽ được bọc theo custom exception handler:

```json
{
  "error": {
    "status_code": 400,
    "message": "Bad Request",
    "details": {
      "field": ["..."]
    }
  }
}
```

- Một số view trả lỗi thủ công nên **không theo format trên** (được ghi rõ ở từng endpoint).

---

## Auth

### POST `/api/auth/register/`

**Chức năng**: Đăng ký tài khoản mới.

**Auth**: Public

**Request (JSON)**

```json
{
  "email": "user@example.com",
  "username": "optional_username",
  "password": "YourPassw0rd!",
  "password_confirm": "YourPassw0rd!"
}
```

**Response 201**

```json
{
  "message": "Chúc mừng user@example.com, tài khoản đã được tạo thành công!",
  "user": {
    "username": "optional_username",
    "email": "user@example.com"
  }
}
```

**Validation/Errors**

- 400 (chuẩn DRF, sẽ bọc theo custom exception handler):

```json
{
  "error": {
    "status_code": 400,
    "message": "Bad Request",
    "details": {
      "password": ["Mật khẩu không khớp."]
    }
  }
}
```

**Notes cho frontend**

- User mới mặc định `is_verified=false` ⇒ login sẽ bị chặn cho đến khi user được verify (hiện chưa thấy endpoint verify email).

---

### POST `/api/auth/login/`

**Chức năng**: Đăng nhập, set cookie `access_token` và `refresh_token`.

**Auth**: Public

**Request (JSON)**

```json
{
  "email": "user@example.com",
  "password": "YourPassw0rd!"
}
```

**Response 200**

```json
{
  "message": "Đăng nhập thành công!",
  "user": {
    "id": 1,
    "username": "u",
    "email": "user@example.com"
  }
}
```

**Cookie side-effects**

- Set-Cookie: `access_token=...; HttpOnly; SameSite=Lax; Secure=(prod)`
- Set-Cookie: `refresh_token=...; HttpOnly; SameSite=Lax; Path=/api/auth/; Secure=(prod)`

**Dev-only**

- Nếu `DEBUG=True`, backend còn trả thêm token trong body:

```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

**Errors**

- 200 nếu đã login sẵn:

```json
{ "message": "Bạn đã đăng nhập rồi!" }
```

- 400 (bọc theo custom exception handler) khi sai email/pass, inactive, chưa verify, thiếu field:

```json
{
  "error": {
    "status_code": 400,
    "message": "Bad Request",
    "details": [
      "Email hoặc mật khẩu không chính xác. Vui lòng thử lại."
    ]
  }
}
```

(Lưu ý: `details` có thể là list string hoặc object tùy lỗi serializer.)

---

### POST `/api/auth/logout/`

**Chức năng**: Đăng xuất, blacklist refresh token (nếu có), xóa cookie.

**Auth**: Required

**Request**: không body

**Response 200**

```json
{ "message": "Đăng xuất thành công!" }
```

**Cookie side-effects**

- Xóa `access_token`
- Xóa `refresh_token` (path `/api/auth/`)

**Errors**

- 400 (KHÔNG theo format custom exception handler):

```json
{ "error": "Có lỗi xảy ra hoặc phiên đã hết hạn." }
```

---

### GET `/api/auth/me/`

**Chức năng**: Lấy user hiện tại từ access token.

**Auth**: Required

**Response 200**

```json
{
  "id": 1,
  "username": "u",
  "email": "user@example.com",
  "role": "customer"
}
```

**Errors**

- 401 (thường theo custom exception handler) nếu thiếu/expired access token:

```json
{
  "error": {
    "status_code": 401,
    "message": "Unauthorized",
    "details": { "detail": "..." }
  }
}
```

**Note**

- `role` hiện không có trong model ⇒ thực tế gần như luôn `"customer"`.

---

### POST `/api/auth/token/refresh/`

**Chức năng**: Làm mới phiên đăng nhập bằng refresh token từ cookie; set cookie mới.

**Auth**: Dùng refresh cookie (không cần access token)

**Request**: không body (backend tự đọc `refresh_token` từ cookie)

**Response 200**

```json
{ "message": "Làm mới phiên đăng nhập thành công!" }
```

**Cookie side-effects**

- Set lại `access_token`
- Do `ROTATE_REFRESH_TOKENS=True`: thường sẽ set lại `refresh_token` mới

**Errors (KHÔNG theo custom exception handler)**

- 401 nếu không có refresh cookie:

```json
{ "error": "Refresh token không tồn tại. Vui lòng đăng nhập lại." }
```

- 401 nếu token invalid/expired:

```json
{ "error": "Token không hợp lệ hoặc đã hết hạn." }
```

---

## Profile

### GET `/api/profile/me/`

**Chức năng**: Lấy profile của user hiện tại (tự tạo nếu chưa có).

**Auth**: Required

**Response 200**

```json
{
  "full_name": "",
  "avatar": null,
  "phone_number": ""
}
```

---

### PATCH `/api/profile/me/`

**Chức năng**: Cập nhật một phần profile.

**Auth**: Required

**Content-Type**

- `application/json` hoặc `multipart/form-data` (khi upload `avatar`)

**Request (partial)**

- JSON ví dụ:

```json
{
  "full_name": "Nguyen Van A",
  "phone_number": "0987654321"
}
```

- multipart fields:
  - `full_name` (string, optional)
  - `phone_number` (string, optional)
  - `avatar` (file, optional)

**Response 200**

```json
{
  "message": "Thông tin hồ sơ đã được cập nhật thành công!",
  "data": {
    "full_name": "Nguyen Van A",
    "avatar": "/media/avatars/xxx.jpg",
    "phone_number": "0987654321"
  }
}
```

**Errors**

- 400 (KHÔNG theo custom exception handler), ví dụ:

```json
{ "phone_number": ["Số điện thoại không hợp lệ. Vui lòng nhập định dạng 10 số (VD: 0987654321)."] }
```

---

## Frontend integration notes

- Nếu frontend chạy khác domain/port so với backend:
  - Cần cấu hình CORS ở backend và frontend phải bật gửi cookie:
    - `fetch`: `credentials: 'include'`
    - Axios: `withCredentials: true`
- Refresh flow gợi ý:
  - Call API bình thường → nếu 401 do access expired → gọi `POST /api/auth/token/refresh/` → retry request.
- Vì cookie là HttpOnly, frontend **không đọc được token** từ JS.
