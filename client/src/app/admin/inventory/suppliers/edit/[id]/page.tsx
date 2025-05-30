'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import SupplierForm from '@/app/components/supplier/SupplierForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card, message } from 'antd';
import { supplierService } from '@/app/services/supplier.service';
import { SupplierModel } from '@/app/models/supplier.model';

interface Params {
  id: string;
}

const EditSupplierPage = ({ params }: { params: Params }) => {
  const { user, loading: authLoading, hasRole } = useAuth();
  const [supplier, setSupplier] = useState<SupplierModel | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load supplier data when component mounts
  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await supplierService.getById(params.id, true); // true to include deleted suppliers
        setSupplier(data);
      } catch (error) {
        console.error('Error fetching supplier:', error);
        message.error('Không thể tải thông tin nhà cung cấp');
        router.push('/admin/inventory/suppliers');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchSupplier();
    }
  }, [params.id, authLoading, user, router]);

  // Check access permissions
  if (authLoading || loading) {
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
  
  if (!supplier) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Không tìm thấy nhà cung cấp"
        extra={
          <Button type="primary" onClick={() => router.push('/admin/inventory/suppliers')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }
  
  return (
    <AdminLayout title={`Chỉnh sửa nhà cung cấp: ${supplier.name}`}>
      <div className="p-6">
        <Card title={`Chỉnh sửa nhà cung cấp: ${supplier.name}`} className="shadow-sm">
          <SupplierForm 
            supplier={supplier} 
            onSuccess={() => {
              router.refresh(); 
              router.push('/admin/inventory/suppliers');
            }} 
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditSupplierPage;
