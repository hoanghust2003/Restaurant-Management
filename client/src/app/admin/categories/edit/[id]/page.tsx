'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import CategoryForm from '@/app/components/CategoryForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card, message } from 'antd';
import { categoryService } from '@/app/services/category.service';
import { CategoryModel } from '@/app/models/category.model';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

const EditCategoryPage = ({ params }: EditCategoryPageProps) => {
  const { user, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryModel | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await categoryService.getById(params.id);
        setCategory(data);
      } catch (error) {
        console.error('Lỗi khi tải thông tin danh mục:', error);
        message.error('Không thể tải thông tin danh mục');
        router.push('/admin/categories');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchCategory();
    }
  }, [params.id, authLoading, user, router]);
    // Kiểm tra quyền truy cập
  if (authLoading || loading) {
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
  
  if (!category) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Không tìm thấy danh mục"
        extra={
          <Button type="primary" onClick={() => router.push('/admin/categories')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }
    return (
    <AdminLayout title={`Chỉnh sửa danh mục: ${category.name}`}>
      <div className="p-6">
        <Card title={`Chỉnh sửa danh mục: ${category.name}`} className="shadow-sm">
          <CategoryForm category={category} isEdit={true} onSuccess={() => router.push('/admin/categories')} />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditCategoryPage;
