'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
import { 
  Squares2X2Icon, 
  QueueListIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface CustomerLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function CustomerLayout({ children, title }: CustomerLayoutProps) {
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
      title: 'Đặt món',
      items: [
        {
          href: '/menu',
          icon: <QueueListIcon className="w-5 h-5" />,
          title: 'Xem thực đơn',
        },
        {
          href: '/cart',
          icon: <ShoppingCartIcon className="w-5 h-5" />,
          title: 'Giỏ hàng',
        },
        {
          href: '/orders',
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          title: 'Đơn hàng của tôi',
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
