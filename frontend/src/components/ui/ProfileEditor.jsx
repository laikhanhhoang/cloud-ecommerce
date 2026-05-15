import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { normalizeApiError } from '../../api/apiError';
import { useLogout } from '../../hooks/useLogout';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

const pickFirstDetailText = (details) => {
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
};

function DefaultAvatar({ sizeClassName = 'w-20 h-20' }) {
  return (
    <div className={`${sizeClassName} rounded-full bg-slate-200 text-slate-600 flex items-center justify-center border border-gray-200`}>
      <User className="w-10 h-10" />
    </div>
  );
}

export default function ProfileEditor({ user, profile }) {
  const navigate = useNavigate();
  const updateMutation = useUpdateProfile();
  const logoutMutation = useLogout();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!profile || isHydrated) return;
    setFullName(profile.full_name || '');
    setPhoneNumber(profile.phone_number || '');
    setIsHydrated(true);
  }, [profile, isHydrated]);

  const previewUrl = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const avatarUrl = previewUrl || resolveMediaUrl(profile?.avatar);

  const updateError = useMemo(() => {
    if (!updateMutation.error) return null;
    return normalizeApiError(updateMutation.error);
  }, [updateMutation.error]);

  const logoutError = useMemo(() => {
    if (!logoutMutation.error) return null;
    return normalizeApiError(logoutMutation.error);
  }, [logoutMutation.error]);

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setSuccessMessage('');
    if (!file) return;
    setAvatarFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    try {
      const response = await updateMutation.mutateAsync({
        full_name: fullName,
        phone_number: phoneNumber,
        avatar: avatarFile || undefined,
      });

      setAvatarFile(null);
      setSuccessMessage(response?.message || 'Cập nhật thông tin thành công.');
    } catch {
      // handled by updateMutation.error
    }
  };

  const handleLogout = async () => {
    setSuccessMessage('');

    try {
      await logoutMutation.mutateAsync();
    } catch {
      // even if backend errors (expired session), hook may clear user
    } finally {
      navigate('/');
    }
  };

  const isBusy = updateMutation.isPending || logoutMutation.isPending;

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="User avatar"
            className="w-20 h-20 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <DefaultAvatar />
        )}

        <div className="min-w-0">
          <div className="text-lg font-semibold text-gray-900 truncate">{user.username || 'User'}</div>
          <div className="text-sm text-gray-600 truncate">{user.email}</div>
          <label className="inline-block mt-3">
            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 font-medium px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition cursor-pointer text-sm">
              Đổi avatar
            </span>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 border-b pb-2">
            Thông tin hồ sơ
          </h2>

          <div className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
                placeholder="Ví dụ: Nguyễn Văn A"
                disabled={isBusy}
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition"
                placeholder="Ví dụ: 0987654321"
                disabled={isBusy}
              />
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            {successMessage}
          </div>
        )}

        {updateError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="font-semibold">{updateError.message}</div>
            {pickFirstDetailText(updateError.details) && (
              <div className="mt-1">{pickFirstDetailText(updateError.details)}</div>
            )}
          </div>
        )}

        {logoutError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="font-semibold">{logoutError.message}</div>
            {pickFirstDetailText(logoutError.details) && (
              <div className="mt-1">{pickFirstDetailText(logoutError.details)}</div>
            )}
          </div>
        )}

        <div className="pt-4 mt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isBusy}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isBusy}
            className="flex-1 bg-gray-100 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        </div>
      </form>
    </div>
  );
}
