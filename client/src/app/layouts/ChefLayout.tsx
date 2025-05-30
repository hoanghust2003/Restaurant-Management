'use client';

import { ReactNode } from 'react';
import { UserRole } from '../utils/enums';
import BaseLayout from './BaseLayout';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  BuildingStorefrontIcon,
  CakeIcon,
  ArrowPathIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const chefMenuSections = [
  {
    title: 'Tổng quan',
    items: [
      {
        href: '/chef/dashboard',
        icon: <HomeIcon className="w-5 h-5" />,
        title: 'Dashboard',
        showIfRoles: ['chef', 'admin'],
      },
    ],
  },
  {
    title: 'Quản lý món ăn',
    items: [
      {
        href: '#',
        icon: <CakeIcon className="w-5 h-5" />,
        title: 'Quản lý món ăn',
        showIfRoles: ['chef', 'admin'],
        subItems: [
          {
            href: '/chef/dishes',
            title: 'Danh sách món ăn',
            showIfRoles: ['chef', 'admin'],
          },
          {
            href: '/chef/menus',
            title: 'Quản lý thực đơn',
            showIfRoles: ['chef', 'admin'],
          },
          {
            href: '/chef/categories',
            title: 'Danh mục món ăn',
            showIfRoles: ['chef', 'admin'],
          },
        ],
      },
    ],
  },
  {
    title: 'Quản lý bếp',
    items: [
      {
        href: '/chef/orders/active',
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        title: 'Đơn hàng hiện tại',
        showIfRoles: ['chef', 'admin'],
      },
      {
        href: '/chef/orders/queue',
        icon: <QueueListIcon className="w-5 h-5" />,
        title: 'Hàng đợi chế biến',
        showIfRoles: ['chef', 'admin'],
      },
      {
        href: '/chef/orders/history',
        icon: <ArrowPathIcon className="w-5 h-5" />,
        title: 'Lịch sử đơn hàng',
        showIfRoles: ['chef', 'admin'],
      },
    ],
  },
  {
    title: 'Kho và nguyên liệu',
    items: [
      {
        href: '#',
        icon: <BuildingStorefrontIcon className="w-5 h-5" />,
        title: 'Quản lý nguyên liệu',
        showIfRoles: ['chef', 'admin'],
        subItems: [
          {
            href: '/chef/inventory/ingredients',
            title: 'Kiểm tra tồn kho',
            showIfRoles: ['chef', 'admin'],
          },
          {
            href: '/chef/inventory/request',
            title: 'Yêu cầu nguyên liệu',
            showIfRoles: ['chef', 'admin'],
          },
        ],
      },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      {
        href: '/chef/profile',
        icon: <UserIcon className="w-5 h-5" />,
        title: 'Thông tin cá nhân',
        showIfRoles: ['chef', 'admin'],
      },
      {
        href: '/chef/settings',
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        title: 'Cài đặt bếp',
        showIfRoles: ['chef', 'admin'],
      },
    ],
  },
];

interface ChefLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function ChefLayout({ children, title }: ChefLayoutProps) {
  return (
    <BaseLayout 
      title={title}
      sidebarSections={chefMenuSections} 
      userRole={UserRole.CHEF}
    >
      {children}
    </BaseLayout>
  );
}
