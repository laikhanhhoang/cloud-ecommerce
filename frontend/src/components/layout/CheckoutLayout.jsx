import { Outlet, Link } from 'react-router-dom';
import { Tv2 } from 'lucide-react';

export default function CheckoutLayout() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-gray-50">
      <header className="bg-blue-900 text-white h-16 flex items-center justify-end px-4 sm:px-8 shadow-md sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Tv2 className="w-7 h-7" />
          <span className="text-xl font-extrabold tracking-tight hidden sm:block">TechStore</span>
        </Link>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
