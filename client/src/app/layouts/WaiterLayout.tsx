'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
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
        },
        {
          href: '/orders/create',
          icon: <PencilSquareIcon className="w-5 h-5" />,
          title: 'Gọi món mới',
        },
        {
          href: '/orders',
          icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
          title: 'Đơn hàng hiện tại',
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
