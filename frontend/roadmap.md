# Development Roadmap: E-Commerce Frontend

Sử dụng Roadmap này cùng tính năng Plan Mode của GitHub Copilot. 
**Quy tắc:** Hoàn thành dứt điểm từng Task trước khi chuyển sang Task tiếp theo.

## Phase 1: Foundation Setup
- [x] **Task 1.1:** Khởi tạo project với React (Vite). Cài đặt Tailwind CSS, React Router DOM v6, Zustand, Axios, React Query (@tanstack/react-query), và lucide-react.
- [x] **Task 1.2:** Thiết lập kiến trúc thư mục chuẩn: `api`, `assets`, `components` (chia layout và ui), `hooks`, `pages`, `store`, `utils`.
- [x] **Task 1.3:** Setup cấu hình Router (`BrowserRouter` hoặc `createBrowserRouter`) định nghĩa sẵn các routes: `/`, `/search`, `/category/:id`, `/product/:id`, `/cart`, `/checkout`.

## Phase 2: State Management & Mock API
- [x] **Task 2.1:** Tạo file `store/useCartStore.js` (Zustand). Định nghĩa state: `items` (mảng), và các actions: `addToCart`, `removeFromCart`, `clearCart`. Viết logic tự cộng dồn số lượng nếu sản phẩm đã tồn tại.
- [x] **Task 2.2:** Viết helper `utils/formatCurrency.js` để format số tiền sang VND.
- [x] **Task 2.3:** Setup `api/mockData.js` theo schema Products backend (list + detail), bao gồm `base_price` (string) và `main_image` (nullable).
- [x] **Task 2.4:** Tạo `api/productApi.js` mô phỏng Axios (dùng `Promise` + `setTimeout` 500ms) với filters: `keyword`, `category`, `brand`, `min_price`, `max_price`, `page`, và trả về DRF pagination (`count`, `next`, `previous`, `results`).

## Phase 3: Layouts & Core UI Components
- [x] **Task 3.1:** Xây dựng `Header` component. Phía trái: Logo. Ở giữa: Input Search (bắt sự kiện Enter chuyển hướng sang `/search?q=`). Phía phải: Cart Icon (hiển thị badge số lượng lấy từ Zustand).
- [x] **Task 3.2:** Xây dựng `ProductCard` component (nhận props: id, ảnh, tên, giá). Layout bằng Tailwind, có hover effect cơ bản.
- [x] **Task 3.3:** Xây dựng `MainLayout` (Render Header + `<Outlet />`).
- [x] **Task 3.4:** Xây dựng `CheckoutLayout` (Render Header tối giản: Logo dời sang phải, bỏ Search và Cart + `<Outlet />`).

## Phase 4: Page Implementations
- [x] **Task 4.1:** Code `HomePage`. Thêm dải `CategoryNav` (5 ô click được). Thêm `Banner` tĩnh. Render section "Sản phẩm nổi bật" từ list API (đọc `base_price`, `main_image`).
- [x] **Task 4.2:** Code `CategoryPage`. Lấy category từ params, gọi list API với `category`, render list sản phẩm. Giữ CategoryNav, bỏ Banner.
- [x] **Task 4.3:** Code `SearchResultsPage`. Lấy query từ URL, gọi list API với `keyword`, render kết quả. Bỏ CategoryNav và Banner.
- [x] **Task 4.4:** Code `ProductDetailPage` (theo yêu cầu cũ). Gọi detail API. Giao diện chia 2 cột (hoặc flex): Ảnh (từ `images` hoặc fallback), Tên & Giá (`base_price`). Thêm nút "Thêm vào giỏ" (gọi store + hiện toast) và "Mua ngay" (navigate sang `/checkout`).
- [x] **Task 4.5:** Code `CartPage`. Map list từ Zustand ra giao diện. Thêm nút Xoá cho mỗi dòng. Hiển thị box tính Tổng tiền + Tổng sản phẩm. Nút "Thanh toán toàn bộ".

## Phase 5: Checkout & Final Polish
- [x] **Task 5.1:** Code `CheckoutPage`. Bọc bằng `CheckoutLayout`. Render form 3 trường (Họ tên, SĐT, Địa chỉ - chỉ dùng thẻ input/textarea text bình thường).
- [x] **Task 5.2:** Thêm ảnh tĩnh QR Code thanh toán bên dưới form.
- [x] **Task 5.3:** Xử lý sự kiện "Xác nhận thanh toán": Gọi mock API submitOrder, gọi action `clearCart` của Zustand, hiển thị thông báo "Thanh toán thành công" và chuyển hướng về Trang chủ.

## Phase 6: Authentication & User Profile
- [x] **Task 6.1:** Tạo store Zustand `useAuthStore.js` quản lý state user, logic kiểm tra / auth. Cấu hình Axios Interceptor bắt lỗi 401 để tự động refresh token (theo API backend).
- [x] **Task 6.2:** Code `api/authApi.js` & `api/profileApi.js` (Gọi thật hoặc mock chuẩn theo api-auth-user.md). Set `withCredentials = true` trong Axios để gửi/nhận JWT cookie (HttpOnly).
- [x] **Task 6.3:** Code `LoginPage` và `RegisterPage`: Gọi API POST `/api/auth/login/` và `/api/auth/register/`. 
- [x] **Task 6.4:** Cập nhật Header để hiển thị icon/tên User nếu đã login, hoặc nút "Đăng nhập".
- [x] **Task 6.5:** Code `ProfilePage`: Hiển thị thông tin GET `/api/profile/me/` và cho phép cập nhật (PATCH `/api/profile/me/`). Thêm nút / chức năng "Đăng xuất" (POST `/api/auth/logout/`).

## Phase 7: Products Refactor to Backend API
- [x] **Task 7.1:** Cập nhật `api/productApi.js` trả về DRF pagination (`count`, `next`, `previous`, `results`) và hỗ trợ filters: `keyword`, `category`, `brand`, `min_price`, `max_price`, `page`.
- [x] **Task 7.2:** Chuẩn hóa `api/mockData.js` theo schema backend (list + detail), dùng `base_price` (string) và `main_image` có thể `null`.
- [x] **Task 7.3:** Cập nhật `hooks/useProducts.js` và `hooks/useProductDetail.js` để map đúng field mới (`results`, `base_price`, `main_image`, `images`).
- [x] **Task 7.4:** Cập nhật `HomePage`, `CategoryPage`, `SearchResultsPage` để đọc `results[]`, parse `base_price` và xử lý `main_image` null.
- [x] **Task 7.5:** Cập nhật `ProductDetailPage` (theo yêu cầu cũ): dùng `images`/fallback, hiển thị đúng `base_price` (giữ UI chỉ hiện ảnh/tên/giá).
- [x] **Task 7.6:** Bổ sung handling phân trang ở các trang list (`page` param).

## Phase 8: Product Detail (Variants + Gallery + Specs)

Mục tiêu Phase 8 là cập nhật **đúng theo schema Products backend** (xem `products_api.md` và `api-contract.md`) để Product Detail hỗ trợ chọn variant theo **Phiên bản (version)** và **Màu sắc (color)**, tự đổi ảnh/giá theo variant, và hiển thị **Mô tả + Bảng thông số kỹ thuật**.

- [x] **Task 8.1:** Chuẩn hoá dữ liệu detail trong `api/mockData.js` để chắc chắn có đủ: `images[]`, `variants[]`, `options.version`, `options.color`, `description`, `specs` (mỗi field có thể null theo contract).
- [x] **Task 8.2:** Cập nhật `hooks/useProductDetail.js` (nếu cần) để trả về đúng shape theo backend contract, không đổi format field (giữ `base_price`/`price` là string).
- [x] **Task 8.3:** Implement logic chọn variant mặc định khi vào trang `ProductDetailPage`:
	- Nếu có `variants[]`: tự chọn 1 variant mặc định (ưu tiên phần tử hợp lệ đầu tiên), set `selectedVersion` + `selectedColor` theo variant đó.
	- Nếu `options.version`/`options.color` là `null` hoặc `variants[]` rỗng: ẩn UI chọn variant, fallback hiển thị theo `base_price`.
- [x] **Task 8.4:** Implement UI chọn variant theo 2 nhóm:
	- Chọn **Phiên bản (version)** từ `options.version`.
	- Chọn **Màu sắc (color)** từ `options.color`.
	- Khi đổi lựa chọn: user được chọn **độc lập** giữa version và color (không auto đổi option còn lại).
	- Tìm đúng variant trong `variants[]` theo cặp `(version, color)` và cập nhật `selectedVariant`.
	- Nếu không tìm thấy variant khớp cặp đã chọn: coi như chưa chọn được variant, UI fallback `base_price` và ảnh fallback.
- [x] **Task 8.5:** Implement hiển thị ảnh theo quy tắc:
	- Ảnh chính ưu tiên `selectedVariant.variant_image.image` (nếu có).
	- Nếu không có: fallback theo `images[]` (ưu tiên `is_main=true`) rồi fallback `main_image`/ảnh placeholder.
	- Dưới ảnh chính: render 1 hàng thumbnails từ `images[]`; click thumbnail đổi ảnh chính.
- [x] **Task 8.6:** Implement hiển thị giá theo quy tắc:
	- Giá ưu tiên `selectedVariant.price` (string) nếu có, fallback `base_price`.
	- Parse string -> number trước khi format VND.
- [x] **Task 8.7:** Ở phần dưới Product Detail: render
	- Mô tả sản phẩm từ `description` (nếu null/empty thì không bịa nội dung).
	- Bảng thông số kỹ thuật từ `specs` (render động theo key/value; nếu null thì ẩn section).
- [x] **Task 8.8:** Khi bấm "Thêm vào giỏ" / "Mua ngay": cart item phải phản ánh đúng variant đã chọn (lưu ít nhất `variantId`, `version`, `color`, `price`, và ảnh hiển thị) để Cart/Checkout không mất lựa chọn của người dùng.

## Phase 9: Cart Integration (Backend API)

Mục tiêu Phase 9 là migrate Cart từ client-side Zustand sang backend Cart API theo `cart_order_api.md`, nhưng vẫn giữ rule: Header badge phải subscribe Zustand. Lưu ý backend hiện tại thiếu API xoá và sửa item, nên tạm thời ẩn tính năng đó trên giao diện hoặc báo chờ cập nhật.

- [x] **Task 9.1:** Tạo `api/cartApi.js` map đúng endpoints:
	- GET `/api/carts/`, GET `/api/carts/count/`, POST `/api/carts/add/`
	- Chuẩn hoá error wrapper theo backend (đọc `error.details` để hiển thị msg)

- [x] **Task 9.2:** Tạo hooks React Query cho Cart:
	- `useCart()` (GET cart)
	- `useCartCount()` (GET count)
	- `useAddCartItem()` (POST add)
	- Invalidate/refetch queries hợp lý sau mutation

- [x] **Task 9.3:** Cập nhật Zustand `useCartStore.js` để làm “bridge” cho UI:
	- Lưu ít nhất `cartCount` (number) lấy từ API
	- Provide action `setCartCount(count)` (được gọi từ hooks) để Header badge cập nhật reactive

- [x] **Task 9.4:** Cập nhật Header badge để hiển thị `cartCount` từ Zustand (nguồn: `GET /api/carts/count/`).
	- Khi chưa login hoặc API 401: hiển thị 0 (hoặc ẩn badge) theo UX hiện có

- [x] **Task 9.5:** Cập nhật Product Detail actions:
	- Nút “Thêm vào giỏ” gọi `POST /api/carts/add/` với `product_variant_id = selectedVariant.id` và `quantity`
	- Nếu chưa chọn được variant hợp lệ: disable hoặc show toast yêu cầu chọn
	- Nếu 401: điều hướng sang `/login` (giữ lại route hiện tại nếu có)

- [x] **Task 9.6:** Cập nhật CartPage hiển thị theo backend cart:
	- Empty state khi `GET /api/carts/` trả về `id` null hoặc `items` rỗng
	- Render items từ `cart.items[]` và totals từ `cart.total_amount`/`item.line_total`

- [x] **Task 9.7:** Ghi chú UI CartItem: do backend chưa có API cập nhật và xoá lẻ item, tạm thời vô hiệu hoá nút xoá và input thay đổi số lượng trên giao diện để tránh lỗi.

- [x] **Task 9.8:** Cập nhật CheckoutPage lấy items/totals từ backend cart.

## Phase 10: Order/Checkout Integration (Backend API)

Mục tiêu Phase 10 là tích hợp hệ thống Checkout thực tế với API Orders của Backend.

- [x] **Task 10.1:** Tạo `api/orderApi.js` map đúng các endpoints:
	- POST `/api/orders/create/`
	- GET `/api/orders/history/`
	- GET `/api/orders/<id>/`

- [x] **Task 10.2:** Tạo hooks React Query:
	- `useCreateOrder()` (POST create)
	- `useOrderHistory(page)` (GET history)
	- `useOrderDetail(id)` (GET detail)

- [x] **Task 10.3:** Cập nhật sự kiện "Xác nhận thanh toán" tại CheckoutPage:
	- Lấy dữ liệu form (Họ tên, SĐT, Địa chỉ, Ghi chú, Phương thức thanh toán) kết hợp `items` từ Cart hiện tại.
	- Gửi payload lên `POST /api/orders/create/`
	- Xử lý phương thức thanh toán:
		- Nếu chọn `payos`: lấy `checkout_url` trả về từ API và chuyển hướng người dùng (window.location.href).
		- Nếu chọn `cod`: hiển thị thông báo thành công và chuyển hướng về trang chủ hoặc trang lịch sử đơn hàng.

- [x] **Task 10.4:** Bổ sung/Cập nhật trang Order History và Order Detail để hiển thị dữ liệu lịch sử đặt hàng và chi tiết các đơn hàng theo API thực tế từ backend.