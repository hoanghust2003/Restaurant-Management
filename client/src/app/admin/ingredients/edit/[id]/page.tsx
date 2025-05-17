'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import IngredientForm from '@/app/components/ingredient/IngredientForm';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card, message } from 'antd';
import { ingredientService } from '@/app/services/ingredient.service';
import { IngredientModel } from '@/app/models/ingredient.model';

interface Params {
  id: string;
}

const EditIngredientPage = ({ params }: { params: Params }) => {
  const { user, loading: authLoading, hasRole } = useAuth();
  const [ingredient, setIngredient] = useState<IngredientModel | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Tải thông tin nguyên liệu khi component được tạo
  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        const data = await ingredientService.getById(params.id);
        setIngredient(data);
      } catch (error) {
        console.error('Error fetching ingredient:', error);
        message.error('Không thể tải thông tin nguyên liệu');
        router.push('/admin/ingredients');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchIngredient();
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
  
  if (!ingredient) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Không tìm thấy nguyên liệu"
        extra={
          <Button type="primary" onClick={() => router.push('/admin/ingredients')}>
            Quay lại danh sách
          </Button>
        }
      />
    );
  }
  
  return (
    <AdminLayout title={`Chỉnh sửa nguyên liệu: ${ingredient.name}`}>
      <div className="p-6">
        <Card title={`Chỉnh sửa nguyên liệu: ${ingredient.name}`} className="shadow-sm">
          <IngredientForm 
            ingredient={ingredient} 
            isEdit={true} 
            onSuccess={() => router.push('/admin/ingredients')} 
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditIngredientPage;
