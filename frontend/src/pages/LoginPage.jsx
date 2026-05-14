import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { normalizeApiError } from '../api/apiError';
import { useLogin } from '../hooks/useLogin';

const isSafeNextPath = (value) => {
  if (typeof value !== 'string') return false;
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//')) return false;
  return true;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const registered = searchParams.get('registered') === '1';
  const nextParam = searchParams.get('next');

  const normalizedError = useMemo(() => {
    if (!loginMutation.error) return null;
    return normalizeApiError(loginMutation.error);
  }, [loginMutation.error]);

  const detailsText = useMemo(() => {
    const details = normalizedError?.details;

    if (!details) return null;

    if (Array.isArray(details) && details.length > 0) {
      return String(details[0]);
    }

    if (typeof details === 'string') {
      return details;
    }

    if (typeof details === 'object') {
      const firstKey = Object.keys(details)[0];
      const value = details[firstKey];

      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === 'string') return value;
    }

    return null;
  }, [normalizedError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await loginMutation.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
      });

      const nextPath = isSafeNextPath(nextParam)
        ? nextParam
        : (location.state && isSafeNextPath(location.state.next) ? location.state.next : '/');

      navigate(nextPath);
    } catch {
      // handled by mutation.error
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đăng nhập</h1>
        <p className="text-gray-500 mt-2">Chào mừng bạn quay trở lại</p>
      </div>

      {registered && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          Đăng ký thành công. Vui lòng đăng nhập.
        </div>
      )}

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
              placeholder="user@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {normalizedError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <div className="font-semibold">{normalizedError.message}</div>
              {detailsText && <div className="mt-1">{detailsText}</div>}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
