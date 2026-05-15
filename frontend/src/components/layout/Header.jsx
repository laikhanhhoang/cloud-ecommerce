import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Tv2, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartCount } from '../../hooks/useCartCount';
import { useProfile } from '../../hooks/useProfile';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';

function DefaultAvatar({ sizeClassName = 'w-9 h-9' }) {
  return (
    <div className={`${sizeClassName} rounded-full bg-blue-800/60 text-white flex items-center justify-center border border-blue-700`}>
      <User className="w-5 h-5" />
    </div>
  );
}

export default function Header({ showSearch = true, showCart = true, showAccount = true }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const cartCount = useCartStore((state) => state.cartCount);
  const user = useAuthStore((state) => state.user);
  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);
  const { data: profile } = useProfile({ enabled: !!user });
  const avatarUrl = resolveMediaUrl(profile?.avatar);

  // Keep server-side cart badge synced into Zustand.
  useCartCount({ enabled: showCart });

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-blue-900 text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Tv2 className="w-7 h-7" />
          <span className="text-xl font-extrabold tracking-tight hidden sm:block">TechStore</span>
        </Link>

        {/* Center: Search Bar */}
        {showSearch && (
          <div className="flex-1 max-w-xl mx-4 sm:mx-8 relative text-gray-900">
            <input 
              type="text" 
              placeholder="Bạn cần tìm gì hôm nay?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-4 pr-10 py-2 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
            <Search 
              className="absolute right-3 top-2.5 text-gray-500 w-5 h-5 cursor-pointer hover:text-blue-600" 
              onClick={handleSearchClick}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Right: Cart Icon */}
          {showCart && (
            <Link to="/cart" className="relative flex items-center p-2 hover:bg-blue-800 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute max-w-[24px] overflow-hidden -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-blue-900">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Right: Account Avatar + Username */}
          {showAccount && (
            <Link
              to={user ? '/profile' : '/login?next=/profile'}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                isAuthInitialized ? 'hover:bg-blue-800' : 'pointer-events-none opacity-80'
              }`}
              aria-label={
                !isAuthInitialized
                  ? 'Đang kiểm tra đăng nhập'
                  : (user ? 'Mở trang profile' : 'Đi tới trang đăng nhập')
              }
            >
              {user && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="w-9 h-9 rounded-full object-cover border border-blue-700"
                />
              ) : (
                <DefaultAvatar />
              )}
              <span className="text-[11px] leading-none mt-1 max-w-[84px] truncate">
                {!isAuthInitialized
                  ? '...'
                  : (user ? (user.username || 'User') : 'Đăng nhập')}
              </span>
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}
