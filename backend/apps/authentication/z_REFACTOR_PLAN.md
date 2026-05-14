# 📋 Kế hoạch Refactor: Tách App Authentication

Tài liệu này dùng để theo dõi tiến độ tách logic xác thực từ `apps.users` sang `apps.authentication`.

---

## 🏗 Giai đoạn 1: Chuẩn bị và Khởi tạo
- [X] **Tạo app mới:** Chạy lệnh `python manage.py startapp authentication` bên trong thư mục `apps/`.
- [ ] **Khai báo App:** Thêm `'apps.authentication'` vào `INSTALLED_APPS` và cập nhật lại đường dẫn trong `apps/authentication/apps.py`.

## ⚙️ Giai đoạn 2: Di chuyển Logic Authentication
- [X] **Di chuyển Auth Logic:** Chuyển các file như `authenticate.py`, `backends.py` hoặc các hàm tạo JWT từ `users` sang `authentication`.
- [X] **Tách Serializers:** Mang `LoginSerializer`, `TokenSerializer` sang `authentication/serializers.py`; giữ `UserSerializer` lại tại `users`.
- [x] **Tách Views:** Chuyển `LoginView`, `RefreshTokenView`, `LogoutView` sang `authentication/views.py`.

## 🛡 Giai đoạn 3: Giữ vững Model và Cấu hình
- [ ] **Cố định User Model:** Tuyệt đối giữ `CustomUser` model tại `apps.users` để tránh lỗi gãy liên kết database (Migration).
- [ ] **Cập nhật Import:** Quét toàn bộ project và sửa lại các dòng import từ `apps.users.auth...` thành `apps.authentication...`.
- [ ] **Cấu hình URL:** Chia nhỏ `urls.py`; `authentication/urls.py` giữ các endpoint `/login`, `/refresh` và nối vào `core/urls.py`.

## 🧪 Giai đoạn 4: Kiểm tra và Dọn dẹp
- [ ] **Kiểm tra Migrations:** Chạy `makemigrations` và `migrate`; nếu bạn không đổi Model thì sẽ không có thay đổi nào về bảng.
- [ ] **Test API:** Sử dụng Postman kiểm tra lại luồng Đăng nhập -> Lấy Token -> Truy cập Profile xem có bị lỗi 401/403 không.
- [ ] **Xóa Code thừa:** Sau khi mọi thứ chạy ổn định, xóa các file hoặc đoạn code cũ đã được di chuyển khỏi `apps.users`.

---

> **💡 Lưu ý nhỏ:** Khi import User model sang app mới, hãy luôn dùng `from django.contrib.auth import get_user_model` để đảm bảo tính linh hoạt. Chúc bạn "phẫu thuật" thành công!