'use client';

import { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import Sidebar from './Sidebar';
import { 
  Squares2X2Icon, 
  ArchiveBoxIcon, 
  TruckIcon,
  RectangleStackIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

interface WarehouseLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function WarehouseLayout({ children, title }: WarehouseLayoutProps) {
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
      title: 'Quản lý kho',
      items: [
        {
          href: '/inventory/ingredients',
          icon: <RectangleStackIcon className="w-5 h-5" />,
          title: 'Nguyên liệu',
        },
        {
          href: '/inventory/imports',
          icon: <ArrowsRightLeftIcon className="w-5 h-5" />,
          title: 'Nhập/Xuất kho',
        },
        {
          href: '/inventory/suppliers',
          icon: <TruckIcon className="w-5 h-5" />,
          title: 'Nhà cung cấp',
        },
        {
          href: '/inventory',
          icon: <ArchiveBoxIcon className="w-5 h-5" />,
          title: 'Tổng quan kho',
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
