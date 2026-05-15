import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { normalizeApiError } from '../api/apiError';
import { useRegister } from '../hooks/useRegister';

export default function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
  });

  const [clientError, setClientError] = useState('');

  const normalizedError = useMemo(() => {
    if (!registerMutation.error) return null;
    return normalizeApiError(registerMutation.error);
  }, [registerMutation.error]);

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
    setClientError('');

    if (formData.password !== formData.passwordConfirm) {
      setClientError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: formData.email.trim(),
        username: formData.username.trim() || undefined,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
      });

      navigate('/login?registered=1');
    } catch {
      // handled by mutation.error
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đăng ký</h1>
        <p className="text-gray-500 mt-2">Tạo tài khoản mới</p>
      </div>

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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
              placeholder="optional_username"
              autoComplete="username"
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
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              value={formData.passwordConfirm}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {clientError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {clientError}
            </div>
          )}

          {normalizedError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              <div className="font-semibold">{normalizedError.message}</div>
              {detailsText && <div className="mt-1">{detailsText}</div>}
            </div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? 'Đang xử lý...' : 'Đăng ký'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
