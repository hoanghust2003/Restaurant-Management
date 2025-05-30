'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import SupplierForm from '@/app/components/supplier/SupplierForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card } from 'antd';

const CreateSupplierPage = () => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  
  // Check access permissions
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }
  
  // If user doesn't have permission
  if (!user || !hasRole(['admin', 'manager', 'warehouse'])) {
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
    <AdminLayout title="Thêm nhà cung cấp mới">
      <div className="p-6">
        <Card title="Thêm nhà cung cấp mới" className="shadow-sm">
          <SupplierForm />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateSupplierPage;
