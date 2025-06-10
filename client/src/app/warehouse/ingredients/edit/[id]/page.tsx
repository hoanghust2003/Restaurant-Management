'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Typography, Spin, Alert, Button } from 'antd';
import IngredientForm from '@/app/components/ingredient/IngredientForm';
import { ingredientService } from '@/app/services/ingredient.service';
import { IngredientModel } from '@/app/models/ingredient.model';

const { Title, Text } = Typography;

interface EditIngredientPageProps {
  params: Promise<{ id: string }>;
}

const EditIngredientPage: React.FC<EditIngredientPageProps> = ({ params }) => {
  const router = useRouter();
  const [ingredient, setIngredient] = useState<IngredientModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredientId, setIngredientId] = useState<string>('');

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setIngredientId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        setLoading(true);
        const data = await ingredientService.getById(ingredientId);
        setIngredient(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching ingredient:', err);
        setError(err.message || 'Không thể tải thông tin nguyên liệu');
      } finally {
        setLoading(false);
      }
    };

    if (ingredientId) {
      fetchIngredient();
    }
  }, [ingredientId]);

  const handleSuccess = () => {
    router.refresh();
    router.push('/warehouse/ingredients');
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button onClick={() => router.push('/warehouse/ingredients')} size="small">
                Quay lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Title level={4}>Chỉnh sửa nguyên liệu</Title>
        {ingredient && (
          <IngredientForm 
            ingredient={ingredient} 
            isEdit={true} 
            onSuccess={handleSuccess}
          />
        )}
      </Card>
    </div>
  );
};

export default EditIngredientPage;
