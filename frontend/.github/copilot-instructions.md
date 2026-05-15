# GitHub Copilot Instructions

## 1. Prime Directives
- **MANDATORY:** You must ALWAYS read `requirements.md` and `api-contract.md` before generating ANY code, answering questions, or planning tasks.
- Act as an Expert Senior React Developer. Write clean, modular, scalable, and self-documenting code.
- We are building the FRONTEND ONLY using Mock Data. However, the architecture must completely separate UI components from data fetching to support immediate REST API integration later.

## 2. Tech Stack
- Framework: React (Vite)
- Language: JavaScript (ES6+)
- Styling: Tailwind CSS
- Routing: React Router DOM v6
- State Management: Zustand (specifically for Cart global state)
- Data Fetching: Axios + TanStack Query (React Query)
- Icons: Lucide React

## 3. Coding Standards & Component Rules
- **Modularity:** Keep components small and focused. If a file exceeds 150 lines, refactor it into smaller sub-components in the `components/ui` folder.
- **Separation of Concerns:** DO NOT put `fetch` or `axios` calls directly inside React UI components. Always create custom hooks (e.g., `useProducts.js`) that wrap Axios/React Query calls.
- **Naming Conventions:**
  - Components/Pages: `PascalCase` (e.g., `ProductCard.jsx`).
  - Hooks/Utils/Functions: `camelCase` (e.g., `useCartStore.js`, `formatCurrency.js`).
- **Styling:** Strictly use Tailwind CSS utility classes. Avoid custom CSS files unless doing complex keyframe animations.

## 4. Strict Business Logic
- **Header Cart Icon:** Must reactively subscribe to the Zustand cart store and display the current total quantity of items.
- **Checkout Layout:** The header on the Checkout page is distinctly different. It has NO search bar, NO cart icon, and the Logo is aligned to the RIGHT.
- **Product Details:** MUST support variant selection + gallery + description/specs per `requirements.md` + `api-contract.md`:
  - Show main image + 1 row thumbnails from `images[]` (click thumbnail changes main image).
  - Provide variant selection by **Version** (`version`) and **Color** (`color`) mapped from `options` + `variants[]`.
  - Default-select a valid variant on page load (if `variants[]` exists) and update UI accordingly.
  - When selection changes, main image prefers `selectedVariant.variant_image.image` (if any) and price prefers `selectedVariant.price` (else fallback `base_price`).
  - Render product `description` and `specs` under the main section; render `specs` as a table.
  - Do NOT invent description/specs if API returns null/empty.
- **Mocking:** Simulate realistic network delays (e.g., 500ms) in the mock API calls to ensure Loading Spinners/Skeletons render correctly.
- **Authentication:** Token logic must adhere to backend rules (HttpOnly Cookies). Define Axios Interceptors to handle 401 Unauthorized errors and automatically call the `/api/auth/token/refresh/` endpoint, then retry the original request.
- **User Store:** Create a `useAuthStore` in Zustand to manage local `user` information fetched from `/api/auth/me/`.