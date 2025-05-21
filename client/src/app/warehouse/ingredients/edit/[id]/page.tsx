'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Spin, Alert } from 'antd';
import IngredientForm from '@/app/components/ingredient/IngredientForm';
import { ingredientService } from '@/app/services/ingredient.service';
import { IngredientModel } from '@/app/models/ingredient.model';

const { Title, Text } = Typography;

const EditIngredientPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ingredient, setIngredient] = useState<IngredientModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        setLoading(true);
        const data = await ingredientService.getById(params.id);
        setIngredient(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching ingredient:', err);
        setError(err.message || 'Không thể tải thông tin nguyên liệu');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchIngredient();
    }
  }, [params.id]);

  const handleSuccess = () => {
    router.push('/warehouse/ingredients');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin nguyên liệu..." />
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy thông tin nguyên liệu'}
          type="error"
          showIcon
          action={
            <Button 
              type="primary" 
              onClick={() => router.push('/warehouse/ingredients')}
            >
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Title level={4}>Chỉnh sửa nguyên liệu</Title>
        <Text type="secondary" className="mb-4 block">
          Cập nhật thông tin nguyên liệu
        </Text>
        <IngredientForm 
          ingredient={ingredient}
          isEdit={true}
          onSuccess={handleSuccess}
        />
      </Card>
    </div>
  );
};

export default EditIngredientPage;
