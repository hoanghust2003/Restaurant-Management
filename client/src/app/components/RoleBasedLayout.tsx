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
    if (!loading && (!user || !hasRole(allowedRoles))) {
      router.push('/'); // Redirect to home if not authorized
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

  if (user.role === 'waiter') {
    return <WaiterLayout title={title}>{children}</WaiterLayout>;
  }

  // Fallback layout (should not reach here if allowedRoles is correct)
  return <AdminLayout title={title}>{children}</AdminLayout>;
}
