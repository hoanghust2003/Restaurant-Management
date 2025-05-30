'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import MenuList from '@/app/components/menu/MenuList';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button } from 'antd';

const MenusPage = () => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
    // Check access permission
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large">
          <div className="p-8 text-center">Đang tải...</div>
        </Spin>
      </div>
    );
  }
  
  // If no access permission
  if (!user || !hasRole(['admin', 'manager', 'chef'])) {
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
    <AdminLayout title="Quản lý thực đơn">
      <MenuList />
    </AdminLayout>
  );
};

export default MenusPage;
