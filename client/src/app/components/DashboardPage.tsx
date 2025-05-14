'use client';

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  CogIcon,
  Square3Stack3DIcon,
  FireIcon,
  QueueListIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import LayoutProvider from '../layouts/LayoutProvider';

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

export default function DashboardPage() {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
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

  if (!isAuthenticated || !user) {
    return null; // Will be redirected by the useEffect
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Table management - only for admin, waiter, and cashier */}
        {hasRole(['admin', 'waiter', 'cashier']) && (
          <DashboardCard
            title="Quản lý bàn"
            description="Xem và quản lý trạng thái bàn"
            icon={<Square3Stack3DIcon className="w-6 h-6 text-blue-600" />}
            href="/tables/router"
            color="border-blue-500"
          />
        )}
        
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
    </div>
  );
}
