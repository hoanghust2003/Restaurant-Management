'use client';

import { ReactNode } from 'react';
import { UserRole } from '../utils/enums';
import BaseLayout from './BaseLayout';
import { SocketProvider } from '../contexts/SocketContext';
import { KitchenProvider } from '../contexts/KitchenContext';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  ArrowPathIcon,
  UserIcon,
  Cog6ToothIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const kitchenMenuSections = [
  {
    title: 'Tổng quan',
    items: [
      {
        href: '/kitchen/dashboard',
        icon: <HomeIcon className="w-5 h-5" />,
        title: 'Bảng điều khiển',
        showIfRoles: ['chef', 'kitchen', 'admin'],
      },
    ],
  },
  {
    title: 'Quản lý đơn hàng',
    items: [
      {
        href: '/kitchen/orders/active',
        icon: <FireIcon className="w-5 h-5" />,
        title: 'Đơn hàng đang chế biến',
        showIfRoles: ['chef', 'kitchen', 'admin'],
      },
      {
        href: '/kitchen/orders/queue',
        icon: <QueueListIcon className="w-5 h-5" />,
        title: 'Hàng đợi chế biến',
        showIfRoles: ['chef', 'kitchen', 'admin'],
      },
      {
        href: '/kitchen/orders/history',
        icon: <ArrowPathIcon className="w-5 h-5" />,
        title: 'Lịch sử đơn hàng',
        showIfRoles: ['chef', 'kitchen', 'admin'],
      },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      {
        href: '/kitchen/profile',
        icon: <UserIcon className="w-5 h-5" />,
        title: 'Thông tin cá nhân',
        showIfRoles: ['chef', 'kitchen', 'admin'],
      },
      {
        href: '/kitchen/settings',
        icon: <Cog6ToothIcon className="w-5 h-5" />,
        title: 'Cài đặt bếp',
        showIfRoles: ['chef', 'kitchen', 'admin'],
      },
    ],
  },
];

interface KitchenLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function KitchenLayout({ children, title }: KitchenLayoutProps) {
  return (
    <SocketProvider>
      <KitchenProvider>
        <BaseLayout
          title={title}
          sidebarSections={kitchenMenuSections}
          userRole={UserRole.CHEF}
        >
          {children}
          <audio id="notificationSound" src="/sounds/notification.mp3" />
        </BaseLayout>
      </KitchenProvider>
    </SocketProvider>
  );
}
