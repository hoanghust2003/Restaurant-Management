'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserGroupIcon, 
  Squares2X2Icon, 
  ArchiveBoxIcon, 
  DocumentChartBarIcon,
  QueueListIcon,
  CogIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user } = useAuth();
  
  const sections = [
    {
      title: 'Tổng quan',
      items: [
        {
          href: '/',
          icon: <Squares2X2Icon className="w-5 h-5" />,
          title: 'Dashboard',
        },
      ],
    },
    {
      title: 'Quản lý',
      items: [
        {
          href: '/users',
          icon: <UserGroupIcon className="w-5 h-5" />,
          title: 'Tài khoản',
          showIfRoles: ['admin'], // Only admin can manage users
        },        {
          href: '/tables',
          icon: <BuildingStorefrontIcon className="w-5 h-5" />,
          title: 'Quản lý bàn',
          showIfRoles: ['admin', 'waiter', 'cashier'], // Admin, waiters and cashiers can manage tables
        },        {
          href: '/admin/ingredients',
          icon: <ArchiveBoxIcon className="w-5 h-5" />,
          title: 'Nguyên liệu',
          showIfRoles: ['admin', 'warehouse'], // Admin và warehouse có thể quản lý nguyên liệu
        },
        {
          href: '/admin/dishes',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Quản lý món ăn',
          showIfRoles: ['admin', 'chef'], // Admin and chefs can manage dishes
          subItems: [
            {
              href: '/admin/categories',
              title: 'Danh mục món ăn',
              showIfRoles: ['admin', 'warehouse', 'chef'], // Admin, warehouse và chef có thể quản lý danh mục
            },
          ]
        },
        {
          href: '/admin/menus',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Thực đơn',
          showIfRoles: ['admin', 'chef'], // Admin and chefs can manage menus
        },
      ],
    },
    {
      title: 'Kho',
      items: [
        {
          href: '/inventory',
          icon: <ArchiveBoxIcon className="w-5 h-5" />,
          title: 'Quản lý kho',
        },
      ],
    },
    {
      title: 'Thống kê',
      items: [
        {
          href: '/reports',
          icon: <DocumentChartBarIcon className="w-5 h-5" />,
          title: 'Báo cáo & Thống kê',
        },
      ],
    },
    {
      title: 'Hệ thống',
      items: [
        {
          href: '/settings',
          icon: <CogIcon className="w-5 h-5" />,
          title: 'Cài đặt hệ thống',
        },
      ],
    },
  ];
  return (
    <BaseLayout 
      title={title} 
      sidebar={<Sidebar sections={sections} userRole={user?.role} />}
    >
      {children}
    </BaseLayout>
  );
}
