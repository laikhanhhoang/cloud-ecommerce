# E-Commerce Electronics Frontend

Frontend cho trang thuong mai dien tu (Dien thoai, Laptop, Tai nghe, Dong ho, Tablet) su dung React (Vite) + Tailwind CSS. Hien tai dung Mock Data nhung bao toan kien truc tich hop REST API trong tuong lai (Axios + React Query).

## Tech Stack

- React (Vite)
- Tailwind CSS
- React Router DOM v6
- Zustand
- Axios + TanStack Query
- Lucide React

## Product API Alignment

Mọi chức năng Products phải tuân theo backend API trong [products_api.md](products_api.md). Ket qua list theo DRF pagination (`count`, `next`, `previous`, `results`), gia tra ve la string (`base_price`), va `main_image` co the `null`.

## Scripts

- `npm install`
- `npm run dev`

## Backend Integration (Auth/Profile/Products)

Frontend da duoc wiring de goi API backend that qua Axios (`src/api/httpClient.js`).

### Env vars

- `VITE_API_BASE_URL`
	- Vi du: `http://localhost:8000`
	- Duoc dung lam `baseURL` cho tat ca request den backend (`/api/...`).
- `VITE_USE_BACKEND_PRODUCTS_API` (optional)
	- `true`: bat buoc Products goi backend
	- `false`: Products dung mock (ngay ca khi da set `VITE_API_BASE_URL`)
	- Neu khong set: Products se tu dong goi backend khi co `VITE_API_BASE_URL` (goi truc tiep) hoac `VITE_BACKEND_URL` (qua Vite proxy `/api`).
- `VITE_BACKEND_URL` (optional)
	- Vi du: `http://localhost:8000`
	- Dung de build absolute URL cho media neu backend tra ve duong dan tuong doi (VD: `/media/...`).

### Notes

- Auth su dung HttpOnly Cookie nen Axios da bat `withCredentials: true`.
- Neu frontend/backed chay khac domain/port: backend can cau hinh CORS + credentials theo huong dan trong `api-auth-user.md`.

## Cart Integration (Backend)

Backend Cart API (server-side cart) da duoc mo ta trong `cart_order_api.md`.

- Muc tieu: migrate Cart tu client-side Zustand sang `/api/cart/*` theo roadmap Phase 9.
- Tai lieu lien quan:
	- `cart_order_api.md` (spec backend)
	- `api-contract.md` (frontend contract, da bo sung Cart section)
	- `docs/cart-mock-api-frontend.md` (ke hoach migrate + mapping UI)

## Documents

- [requirements.md](requirements.md)
- [api-contract.md](api-contract.md)
- [cart_order_api.md](cart_order_api.md)
- [products_api.md](products_api.md)
