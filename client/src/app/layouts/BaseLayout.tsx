'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Sidebar, { SidebarMenuGroup } from './Sidebar';

interface BaseLayoutProps {
  children: ReactNode;
  title?: string;
  sidebar?: ReactNode;
  sidebarSections: SidebarMenuGroup[];
  userRole?: string;
}

export default function BaseLayout({ children, title, sidebar, sidebarSections, userRole }: BaseLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất khỏi hệ thống');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  // Map role to Vietnamese
  const roleNames: Record<string, string> = {
    'admin': 'Quản trị viên',
    'waiter': 'Nhân viên phục vụ',
    'chef': 'Đầu bếp',
    'cashier': 'Thu ngân',
    'warehouse': 'Nhân viên kho',
    'customer': 'Khách hàng'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 lg:hidden mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
                <span className="sr-only">
                  {sidebarOpen ? 'Đóng menu' : 'Mở menu'}
                </span>
              </button>
              <Link href="/" className="flex items-center">
                <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                  Quản lý nhà hàng
                </h1>
              </Link>
              {title && (
                <span className="ml-4 text-gray-600 hidden md:block">
                  / {title}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role && roleNames[user.role]}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link 
                  href="/account"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <UserCircleIcon className="h-4 w-4 mr-1 sm:mr-0" />
                  <span className="hidden sm:inline-block sm:ml-1">Tài khoản</span>
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1 sm:mr-0" />
                  <span className="hidden sm:inline-block sm:ml-1">Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden`}
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="overflow-y-auto h-full py-4">
              {sidebar}
            </div>
          </div>
        </aside>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-lg overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="h-8 w-auto"
                src="/logo.png"
                alt="Restaurant Logo"
              />
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <Sidebar sections={sidebarSections} userRole={userRole} />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-center text-gray-500">
            &copy; {new Date().getFullYear()} Restaurant Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
