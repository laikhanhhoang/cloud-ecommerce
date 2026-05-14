import { Link } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useAuthStore } from '../store/useAuthStore';
import ProfileEditor from '../components/ui/ProfileEditor';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const { data: profile, isLoading } = useProfile({ enabled: !!user });

  if (!isAuthInitialized) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">Bạn cần đăng nhập để xem profile.</p>
        <Link
          to="/login?next=/profile"
          className="inline-block mt-4 bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {isLoading && (
        <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-sm">
          Đang tải thông tin hồ sơ...
        </div>
      )}

      <ProfileEditor user={user} profile={profile} />
    </div>
  );
}
