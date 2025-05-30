'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import MenuDetail from '@/app/components/menu/MenuDetail';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button } from 'antd';

interface Params {
  id: string;
}

const ViewMenuPage = ({ params }: { params: Params }) => {
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
  if (!user || !hasRole(['admin', 'chef', 'staff'])) {
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
    <AdminLayout title="Chi tiết thực đơn">
      <MenuDetail menuId={params.id} />
    </AdminLayout>
  );
};

export default ViewMenuPage;
