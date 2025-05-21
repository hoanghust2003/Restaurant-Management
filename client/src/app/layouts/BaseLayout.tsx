'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CustomLink from '../components/CustomLink';
import { toast } from 'react-toastify';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import ContentWrapper from '../components/ContentWrapper';

interface SidebarMenuGroup {
  title: string;
  items: {
    href: string;
    icon?: ReactNode;
    title: string;
    showIfRoles?: string[];
    subItems?: {
      href: string;
      title: string;
      showIfRoles?: string[];
    }[];
  }[];
}

interface BaseLayoutProps {
  children: ReactNode;
  title?: string;
  sidebar?: ReactNode;
  sidebarSections: SidebarMenuGroup[];
  userRole?: string;
}

const roleNames: Record<string, string> = {
  admin: 'Quản trị viên',
  waiter: 'Nhân viên phục vụ',
  chef: 'Đầu bếp',
  cashier: 'Thu ngân',
  warehouse: 'Nhân viên kho',
  customer: 'Khách hàng',
};

export default function BaseLayout({ children, title, sidebarSections, userRole }: BaseLayoutProps) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r shadow z-20">
          <div className="flex items-center h-[60px] px-4 border-b">
            <CustomLink href="/" className="flex items-center space-x-2">
              <img src="/logo.png" className="h-8 w-auto" alt="Logo" />
              <span className="text-base font-bold text-gray-800">Việt Cuisine</span>
            </CustomLink>
          </div>
          <div className="flex-1 overflow-y-auto pt-4">
            
            <div className="px-4 pt-2">
              <Sidebar sections={sidebarSections} userRole={userRole} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b shadow-sm sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sidebarOpen ? (
                    <XMarkIcon className="h-5 w-5" />
                  ) : (
                    <Bars3Icon className="h-5 w-5" />
                  )}
                  <span className="sr-only">{sidebarOpen ? 'Đóng menu' : 'Mở menu'}</span>
                </button>
                {title && (
                  <span className="text-sm font-semibold text-gray-700">{title}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role && roleNames[user.role]}</p>
                </div>
                <CustomLink
                  href="/account"
                  title="Tài khoản"
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full"
                >
                  <UserCircleIcon className="h-5 w-5" />
                </CustomLink>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Sidebar Overlay */}
          <aside
            className={`${
              sidebarOpen ? 'block' : 'hidden'
            } fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden`}
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <CustomLink href="/" className="flex items-center space-x-2">
                  <img src="/logo.png" className="h-7 w-auto" alt="Logo" />
                  <span className="text-sm font-bold text-gray-800">Việt Cuisine</span>
                </CustomLink>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                <Sidebar sections={sidebarSections} userRole={userRole} />
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <ContentWrapper>
                {children}
              </ContentWrapper>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t text-center text-xs text-gray-400 py-3">
        &copy; {new Date().getFullYear()} Restaurant Management System
      </footer>
    </div>
  );
}
