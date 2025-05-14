'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { 
  Squares2X2Icon, 
  BuildingStorefrontIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

interface WaiterLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function WaiterLayout({ children, title }: WaiterLayoutProps) {
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
      title: 'Phục vụ',
      items: [
        {
          href: '/tables',
          icon: <BuildingStorefrontIcon className="w-5 h-5" />,
          title: 'Danh sách bàn',
          showIfRoles: ['waiter', 'cashier'], // Only waiters and cashiers
        },
        {
          href: '/orders/create',
          icon: <PencilSquareIcon className="w-5 h-5" />,
          title: 'Gọi món mới',
          showIfRoles: ['waiter'], // Only waiters can create new orders
        },
        {
          href: '/orders',
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          title: 'Đơn hàng hiện tại',
          showIfRoles: ['waiter', 'cashier'], // Waiters and cashiers can view orders
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
