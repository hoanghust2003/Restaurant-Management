'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { ReactNode } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import WaiterLayout from '@/app/layouts/WaiterLayout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleBasedLayoutProps {
  children: ReactNode;
  title?: string;
  allowedRoles: string[];
}

export default function RoleBasedLayout({ children, title, allowedRoles }: RoleBasedLayoutProps) {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to login
        router.push('/auth/login');
      } else if (!hasRole(allowedRoles)) {
        // If logged in but doesn't have required role, redirect to home with message
        import('antd').then(({ message }) => {
          message.error(`Bạn không có quyền truy cập với vai trò ${user.role}`);
        });
        router.push('/');
      }
    }
  }, [user, loading, hasRole, allowedRoles, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user || !hasRole(allowedRoles)) {
    return null;
  }
  // Render appropriate layout based on user role
  if (user.role === 'admin') {
    return <AdminLayout title={title}>{children}</AdminLayout>;
  }

  if (user.role === 'staff') {
    return <WaiterLayout title={title}>{children}</WaiterLayout>;
  }

  // Fallback layout (should not reach here if allowedRoles is correct)
  return <AdminLayout title={title}>{children}</AdminLayout>;
}
