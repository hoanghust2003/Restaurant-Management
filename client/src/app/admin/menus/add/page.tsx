'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import MenuForm from '@/app/components/menu/MenuForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card } from 'antd';

const AddMenuPage = () => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  
  // Check access permission
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }
  
  // If no access permission
  if (!user || !hasRole(['admin', 'chef'])) {
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
    <AdminLayout title="Thêm thực đơn mới">
      <div className="p-6">
        <Card title="Thêm thực đơn mới" className="shadow-sm">
          <MenuForm onSuccess={() => router.push('/admin/menus')} />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddMenuPage;
