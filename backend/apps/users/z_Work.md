# 🛡️ Auth & User Milestone Checklist - is402_ecom

### Giai đoạn 1: Base Architecture (Nền móng)
- [x] Định nghĩa Custom Model `UserAuth` (Email làm Username).
- [x] Định nghĩa Model `UserProfile` (One-to-One link).
- [x] Thiết lập `AUTH_USER_MODEL` trong `settings.py`.
- [x] Cấu hình `admin.py` (Inline Profile & Custom UserAdmin).
- [x] Makemigrations & Migrate lần đầu.

### Giai đoạn 2: Automation (Tự động hóa)
- [X] Tạo file `signals.py` để tự động khởi tạo Profile khi User mới đăng ký.
- [X] Khai báo `signals` trong `apps.py` (hàm `ready()`) để signal tự động chạy.

### Giai đoạn 3: API & Serialization (Tầng giao tiếp)
- [X] Cài đặt `djangorestframework`.
- [X] Viết `UserSerializer` & `ProfileSerializer`.
- [X] Viết `RegisterSerializer` (Xử lý băm mật khẩu & tạo tài khoản).

### Giai đoạn 4: Viết các API về thông tin User
- 🚀 Authentication Implementation Checklist (JWT & Cookies) - `api/auth/login`
    - Workflow:
        Người dùng gửi Email/PW qua POST Request
        - LoginView.post() tiếp nhận dữ liệu
        - LoginSerializer.validate() được gọi để kiểm tra logic
        - authenticate() kiểm tra tính hợp lệ của User/Password
        - Kiểm tra điều kiện bổ sung (is_verified, is_active)
        - serializer.is_valid() trả về True
        - RefreshToken.for_user(user) khởi chạy để tạo token
        - CustomTokenObtainPairSerializer.get_token() nhét thêm email/is_verified vào payload
        - Trả về bộ đôi chuỗi Access Token & Refresh Token
        - Response.set_cookie() thực hiện kẹp token vào Cookie HttpOnly
        - Server trả Response thành công về Client
    - Các việc cần làm:
        - [X] **Hoàn thiện Logic Serializer:** Viết `LoginSerializer` để xử lý `authenticate(email, password)`, đồng thời kiểm tra điều kiện `is_verified` trước khi cho phép đăng nhập.
        - [X] **Cấu hình Middleware & Apps:** Thêm `'rest_framework_simplejwt.token_blacklist'` vào `INSTALLED_APPS` và chạy `python manage.py migrate` để hệ thống có chỗ lưu trữ các token bị vô hiệu hóa.
        - [X] **Viết Custom Authentication:** Tạo class `CustomJWTAuthentication` (kế thừa từ SimpleJWT) để ưu tiên đọc token từ `request.COOKIES` thay vì chỉ tìm ở Header `Authorization`.
        - [X] **Đăng ký Settings chuẩn:** Khai báo class xác thực vừa viết vào `DEFAULT_AUTHENTICATION_CLASSES` và đảm bảo `TOKEN_OBTAIN_PAIR_SERIALIZER` trỏ đúng đến class custom của Hoàng.
        - [X] **Thiết lập URL & Logout:** Khai báo route `api/auth/login` và chuẩn bị sẵn một API `Logout` để xóa sạch (clear) các Cookie `access_token`, `refresh_token` khi người dùng thoát.