import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import CheckoutLayout from './components/layout/CheckoutLayout'
import AuthLayout from './components/layout/AuthLayout'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import CategoryPage from './pages/CategoryPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchResultsPage /> },
      { path: 'category/:id', element: <CategoryPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/checkout',
    element: <CheckoutLayout />,
    children: [
      { index: true, element: <CheckoutPage /> },
    ],
  },
])

function App() {
  useAuthBootstrap();
  return <RouterProvider router={router} />
}

export default App
