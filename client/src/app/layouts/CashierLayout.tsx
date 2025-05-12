'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
import { 
  Squares2X2Icon, 
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

interface CashierLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function CashierLayout({ children, title }: CashierLayoutProps) {
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
      title: 'Thanh toán',
      items: [
        {
          href: '/cashier',
          icon: <CurrencyDollarIcon className="w-5 h-5" />,
          title: 'Thanh toán đơn hàng',
        },
        {
          href: '/cashier/orders',
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          title: 'Danh sách đơn hàng',
        },
        {
          href: '/cashier/history',
          icon: <ClockIcon className="w-5 h-5" />,
          title: 'Lịch sử thanh toán',
        },
      ],
    },
    {
      title: 'Quản lý',
      items: [
        {
          href: '/tables',
          icon: <BuildingStorefrontIcon className="w-5 h-5" />,
          title: 'Quản lý bàn',
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
