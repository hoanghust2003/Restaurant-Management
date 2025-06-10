'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import MenuDetail from '@/app/components/menu/MenuDetail';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button } from 'antd';

interface ViewMenuPageProps {
  params: Promise<{ id: string }>;
}

const ViewMenuPage = ({ params }: ViewMenuPageProps) => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  const [menuId, setMenuId] = useState<string>('');

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setMenuId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);
  
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
      {menuId ? <MenuDetail menuId={menuId} /> : <Spin />}
    </AdminLayout>
  );
};

export default ViewMenuPage;
