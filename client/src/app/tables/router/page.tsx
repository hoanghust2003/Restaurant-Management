'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import { useAuth } from '@/app/contexts/AuthContext';

export default function TablesRouterPage() {
  const router = useRouter();
  const { user, loading, hasRole } = useAuth();
  useEffect(() => {
    if (!loading && user) {
      if (hasRole(['admin'])) {
        // Only admin has full access to admin tables page
        router.push('/tables');
      } else if (hasRole(['waiter', 'cashier'])) {
        // Waiters and cashiers only have limited access
        router.push('/waiter/tables');
      } else {
        // Redirect users with other roles to home page
        router.push('/');
      }
    } else if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [user, loading, router, hasRole]);
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return null;
}
