'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
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

  return <>{children}</>;
}
