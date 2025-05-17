'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import CategoryList from '@/app/components/category/CategoryList';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button } from 'antd';

const CategoriesPage = () => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  
  // Kiểm tra quyền truy cập
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }
  
  // Nếu không có quyền truy cập
  if (!user || !hasRole(['admin', 'warehouse'])) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            Về trang chủ
          </Button>
        }
      />
    );
  }
  
  return (
    <AdminLayout title="Quản lý danh mục">
      <CategoryList />
    </AdminLayout>
  );
};

export default CategoriesPage;
