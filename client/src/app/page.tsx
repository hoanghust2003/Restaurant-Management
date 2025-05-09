'use client';

import { useAuth } from "./contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BuildingStorefrontIcon,
  Square3Stack3DIcon,
  FireIcon,
  QueueListIcon,
  ArchiveBoxIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

// Dashboard card component
interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const DashboardCard = ({ title, description, icon, href, color }: DashboardCardProps) => {
  return (
    <Link 
      href={href}
      className={`p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-white border-l-4 ${color} hover:translate-y-[-5px]`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default function Home() {
  const { user, loading, isAuthenticated, logout, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by the useEffect
  }

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất khỏi hệ thống');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Quản lý nhà hàng</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' && 'Quản trị viên'}
                  {user?.role === 'manager' && 'Quản lý'}
                  {user?.role === 'waiter' && 'Nhân viên phục vụ'}
                  {user?.role === 'chef' && 'Đầu bếp'}
                  {user?.role === 'cashier' && 'Thu ngân'}
                  {user?.role === 'warehouse' && 'Nhân viên kho'}
                  {user?.role === 'customer' && 'Khách hàng'}
                </p>
              </div>
              <div>
                <Link 
                  href="/account"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                >
                  <UserCircleIcon className="h-4 w-4 mr-1" />
                  Tài khoản
                </Link>
              </div>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Common modules for all users */}
          <DashboardCard
            title="Quản lý bàn"
            description="Xem và quản lý trạng thái bàn"
            icon={<Square3Stack3DIcon className="w-6 h-6 text-blue-600" />}
            href="/tables"
            color="border-blue-500"
          />
          
          {/* Waiter can manage orders */}
          {hasRole(['admin', 'manager', 'waiter', 'cashier']) && (
            <DashboardCard
              title="Đặt món"
              description="Tạo và quản lý đơn hàng"
              icon={<ClipboardDocumentListIcon className="w-6 h-6 text-green-600" />}
              href="/orders"
              color="border-green-500"
            />
          )}

          {/* Admin and Manager only */}
          {hasRole(['admin', 'manager']) && (
            <>
              <DashboardCard
                title="Quản lý nhân viên"
                description="Thêm, sửa, xóa nhân viên"
                icon={<UserGroupIcon className="w-6 h-6 text-purple-600" />}
                href="/users"
                color="border-purple-500"
              />
              
              <DashboardCard
                title="Báo cáo & thống kê"
                description="Xem báo cáo doanh thu và thống kê"
                icon={<ChartPieIcon className="w-6 h-6 text-yellow-600" />}
                href="/reports"
                color="border-yellow-500"
              />
              
              <DashboardCard
                title="Quản lý thực đơn"
                description="Thêm, sửa, xóa món ăn và thực đơn"
                icon={<QueueListIcon className="w-6 h-6 text-red-600" />}
                href="/menus"
                color="border-red-500"
              />
              
              <DashboardCard
                title="Cài đặt hệ thống"
                description="Thiết lập và cấu hình hệ thống"
                icon={<CogIcon className="w-6 h-6 text-gray-600" />}
                href="/settings"
                color="border-gray-500"
              />
            </>
          )}
          
          {/* Chef only */}
          {hasRole(['chef', 'admin', 'manager']) && (
            <DashboardCard
              title="Giao diện bếp"
              description="Quản lý và xử lý đơn hàng trong bếp"
              icon={<FireIcon className="w-6 h-6 text-orange-600" />}
              href="/kitchen"
              color="border-orange-500"
            />
          )}
          
          {/* Cashier staff only */}
          {hasRole(['cashier', 'admin', 'manager']) && (
            <DashboardCard
              title="Thanh toán"
              description="Xử lý thanh toán và hóa đơn"
              icon={<CurrencyDollarIcon className="w-6 h-6 text-emerald-600" />}
              href="/cashier"
              color="border-emerald-500"
            />
          )}

          {/* Warehouse staff */}
          {hasRole(['warehouse', 'admin', 'manager']) && (
            <DashboardCard
              title="Quản lý kho"
              description="Quản lý nguyên liệu và tồn kho"
              icon={<ArchiveBoxIcon className="w-6 h-6 text-indigo-600" />}
              href="/inventory"
              color="border-indigo-500"
            />
          )}
        </div>

        <div className="mt-10 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Chào mừng, {user?.name}!</h3>
          <p className="text-gray-600 mb-2">
            Bạn đang đăng nhập với vai trò <span className="font-semibold">
              {user?.role === 'admin' && 'Quản trị viên'}
              {user?.role === 'manager' && 'Quản lý'}
              {user?.role === 'waiter' && 'Nhân viên phục vụ'}
              {user?.role === 'chef' && 'Đầu bếp'}
              {user?.role === 'cashier' && 'Thu ngân'}
              {user?.role === 'warehouse' && 'Nhân viên kho'}
              {user?.role === 'customer' && 'Khách hàng'}
            </span>
          </p>
          <p className="text-gray-600">
            Sử dụng các liên kết ở trên để truy cập các tính năng mà bạn có quyền sử dụng.
          </p>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-center text-gray-500">
            &copy; {new Date().getFullYear()} Restaurant Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
