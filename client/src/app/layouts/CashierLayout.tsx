'use client';

import { ReactNode } from 'react';
import { UserRole } from '../utils/enums';
import BaseLayout from './BaseLayout';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const cashierMenuSections = [
  {
    title: 'Tổng quan',
    items: [
      {
        href: '/cashier/dashboard',
        icon: <HomeIcon className="w-5 h-5" />,
        title: 'Dashboard',
        showIfRoles: ['cashier', 'admin', 'manager'],
      },
    ],
  },
  {
    title: 'Quản lý đơn hàng',
    items: [
      {
        href: '#',
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        title: 'Đơn hàng',
        showIfRoles: ['cashier', 'admin', 'manager'],
        subItems: [
          {
            href: '/cashier/orders/active',
            title: 'Đơn hiện tại',
            showIfRoles: ['cashier', 'admin', 'manager'],
          },
          {
            href: '/cashier/orders/history',
            title: 'Lịch sử đơn hàng',
            showIfRoles: ['cashier', 'admin', 'manager'],
          },
        ],
      },
    ],
  },
  {
    title: 'Quản lý thu chi',
    items: [
      {
        href: '#',
        icon: <CurrencyDollarIcon className="w-5 h-5" />,
        title: 'Thanh toán',
        showIfRoles: ['cashier', 'admin', 'manager'],
        subItems: [
          {
            href: '/cashier/payments/pending',
            title: 'Chờ thanh toán',
            showIfRoles: ['cashier', 'admin', 'manager'],
          },
          {
            href: '/cashier/payments/completed',
            title: 'Lịch sử thanh toán',
            showIfRoles: ['cashier', 'admin', 'manager'],
          },
        ],
      },
      {
        href: '/cashier/shifts',
        icon: <ArrowPathIcon className="w-5 h-5" />,
        title: 'Quản lý ca',
        showIfRoles: ['cashier', 'admin', 'manager'],
      },
    ],
  },
  {
    title: 'Báo cáo',
    items: [
      {
        href: '#',
        icon: <ChartBarIcon className="w-5 h-5" />,
        title: 'Báo cáo',
        showIfRoles: ['cashier', 'admin', 'manager'],
        subItems: [
          {
            href: '/cashier/reports/sales',
            title: 'Báo cáo doanh thu',
            showIfRoles: ['cashier', 'admin', 'manager'],
          },
          {
            href: '/cashier/reports/shifts',
            title: 'Báo cáo ca làm việc',
            showIfRoles: ['cashier', 'admin', 'manager'],
          },
        ],
      },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      {
        href: '/cashier/profile',
        icon: <UserIcon className="w-5 h-5" />,
        title: 'Thông tin cá nhân',
        showIfRoles: ['cashier', 'admin', 'manager'],
      },
      {
        href: '/cashier/settings',
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        title: 'Cài đặt thu ngân',
        showIfRoles: ['cashier', 'admin', 'manager'],
      },
    ],
  },
];

interface CashierLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function CashierLayout({ children, title }: CashierLayoutProps) {
  return (
    <BaseLayout
      title={title}
      sidebarSections={cashierMenuSections}
      userRole={UserRole.CASHIER}
    >
      {children}
    </BaseLayout>
  );
}
