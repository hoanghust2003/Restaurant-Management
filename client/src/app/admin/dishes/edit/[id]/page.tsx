'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, message, Alert } from 'antd';
import DishForm from '@/app/components/dish/DishForm';
import { dishService } from '@/app/services/dish.service';
import { DishModel } from '@/app/models/dish.model';
import RoleBasedLayout from '@/app/components/RoleBasedLayout';

const EditDishPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [dish, setDish] = useState<DishModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        setLoading(true);
        const dishData = await dishService.getById(params.id);
        setDish(dishData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dish:', err);
        setError('Không thể tải thông tin món ăn. Vui lòng thử lại sau.');
        message.error('Không thể tải thông tin món ăn');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDish();
    }
  }, [params.id]);

  const handleSuccess = () => {
    router.push('/admin/dishes');
  };

  if (loading) {
    return (
      <RoleBasedLayout allowedRoles={['admin']}>
        <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
          <Spin size="large" tip="Đang tải thông tin món ăn..." />
        </div>
      </RoleBasedLayout>
    );
  }

  if (error) {
    return (
      <RoleBasedLayout allowedRoles={['admin']}>
        <div className="p-6">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <button
                onClick={() => router.push('/admin/dishes')}
                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
              >
                Quay lại
              </button>
            }
          />
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout allowedRoles={['admin']}>
      <div className="p-6">
        {dish && <DishForm dish={dish} isEdit={true} onSuccess={handleSuccess} />}
      </div>
    </RoleBasedLayout>
  );
};

export default EditDishPage;
