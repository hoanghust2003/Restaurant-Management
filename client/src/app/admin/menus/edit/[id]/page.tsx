'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import MenuForm from '@/app/components/menu/MenuForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card, message } from 'antd';
import { menuService } from '@/app/services/menu.service';
import { MenuModel } from '@/app/models/menu.model';

interface Params {
  id: string;
}

const EditMenuPage = ({ params }: { params: Promise<Params> }) => {
  const { user, loading: authLoading, hasRole } = useAuth();
  const [menu, setMenu] = useState<MenuModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuId, setMenuId] = useState<string>('');
  const router = useRouter();

  // Initialize menu ID from params
  useEffect(() => {
    const initializeData = async () => {
      const resolvedParams = await params;
      setMenuId(resolvedParams.id);
    };
    initializeData();
  }, [params]);

  // Load menu data when component mounts
  useEffect(() => {
    if (menuId && !authLoading && user) {
      fetchMenu();
    }
  }, [menuId, authLoading, user]);

  const fetchMenu = async () => {
    try {
      const data = await menuService.getById(menuId);
      setMenu(data);
    } catch (error) {
      console.error('Error loading menu:', error);
      message.error('Không thể tải thông tin thực đơn');
      router.push('/admin/menus');
    } finally {
      setLoading(false);
    }
  };
  
  // Check access permission
  if (authLoading || loading) {
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
  
  if (!menu) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Không tìm thấy thực đơn"
        extra={
          <Button type="primary" onClick={() => router.push('/admin/menus')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }
  
  return (
    <AdminLayout title={`Chỉnh sửa thực đơn: ${menu.name}`}>
      <div className="p-6">
        <Card title={`Chỉnh sửa thực đơn: ${menu.name}`} className="shadow-sm">
          <MenuForm menu={menu} isEdit={true} onSuccess={() => router.push('/admin/menus')} />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditMenuPage;
