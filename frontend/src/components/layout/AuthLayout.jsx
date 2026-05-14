import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-gray-50">
      <Header showSearch={false} showCart={false} showAccount={false} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="p-4 bg-slate-200 text-center text-slate-500 mt-auto shadow-inner">
        <p className="text-sm"> E-Commerce Electronics Frontend mock by Vite & React Router </p>
      </footer>
    </div>
  );
}
