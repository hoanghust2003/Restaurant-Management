'use client';

import { ReactNode } from 'react';
import { CustomerLayout } from '@/app/layouts';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerMenuLayout({ children }: CustomerLayoutProps) {
  return (
    <CustomerLayout>
      {children}
    </CustomerLayout>
  );
}
