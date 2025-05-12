'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
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
        },
        {
          href: '/tables',
          icon: <BuildingStorefrontIcon className="w-5 h-5" />,
          title: 'Quản lý bàn',
        },
        {
          href: '/menus',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Thực đơn & Món ăn',
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
      sidebar={<Sidebar sections={sections} />}
    >
      {children}
    </BaseLayout>
  );
}
