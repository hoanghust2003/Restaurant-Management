'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
import { 
  Squares2X2Icon, 
  FireIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

interface ChefLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function ChefLayout({ children, title }: ChefLayoutProps) {
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
      title: 'Bếp',
      items: [
        {
          href: '/kitchen',
          icon: <FireIcon className="w-5 h-5" />,
          title: 'Món cần chế biến',
        },
        {
          href: '/kitchen/orders',
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          title: 'Danh sách đơn',
        },
        {
          href: '/kitchen/history',
          icon: <ClockIcon className="w-5 h-5" />,
          title: 'Lịch sử chế biến',
        },
      ],
    },
    {
      title: 'Quản lý',
      items: [
        {
          href: '/admin/dishes',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Quản lý món ăn',
        },
        {
          href: '/admin/menus',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Thực đơn',
        },
      ],
    },
    {
      title: 'Quản lý',
      items: [
        {
          href: '/admin/dishes',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Quản lý món ăn',
        },
        {
          href: '/admin/menus',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Thực đơn',
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
