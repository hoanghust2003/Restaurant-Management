'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import CategoryList from '@/app/components/CategoryList';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

/**
 * Trang danh sách danh mục món ăn
 */
export default function CategoriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <AdminLayout title="Quản lý danh mục">
      <CategoryList />
    </AdminLayout>
  );
}
