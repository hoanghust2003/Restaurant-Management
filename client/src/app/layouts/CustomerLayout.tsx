'use client';

import { ReactNode } from 'react';
import { UserRole } from '../utils/enums';
import BaseLayout from './BaseLayout';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const customerMenuSections = [
  {
    title: 'General',
    items: [
      {
        href: '/customer/home',
        icon: <HomeIcon className="w-5 h-5" />,
        title: 'Home',
        showIfRoles: ['customer', 'admin'],
      },
      {
        href: '/customer/menu',
        icon: <BookOpenIcon className="w-5 h-5" />,
        title: 'Menu',
        showIfRoles: ['customer', 'admin'],
      },
    ],
  },
  {
    title: 'Orders',
    items: [
      {
        href: '#',
        icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
        title: 'My Orders',
        showIfRoles: ['customer', 'admin'],
        subItems: [
          {
            href: '/customer/orders/active',
            title: 'Active Orders',
            showIfRoles: ['customer', 'admin'],
          },
          {
            href: '/customer/orders/history',
            title: 'Order History',
            showIfRoles: ['customer', 'admin'],
          },
        ],
      },
    ],
  },
  {
    title: 'Profile',
    items: [
      {
        href: '/customer/profile',
        icon: <UserIcon className="w-5 h-5" />,
        title: 'My Profile',
        showIfRoles: ['customer', 'admin'],
      },
    ],
  },
];

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <BaseLayout sidebarSections={customerMenuSections} userRole={UserRole.CUSTOMER}>
      {children}
    </BaseLayout>
  );
}
