'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import IngredientForm from '@/app/components/ingredient/IngredientForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card } from 'antd';

const CreateIngredientPage = () => {
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
    <AdminLayout title="Thêm nguyên liệu mới">
      <div className="p-6">
        <Card title="Thêm nguyên liệu mới" className="shadow-sm">
          <IngredientForm />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateIngredientPage;
