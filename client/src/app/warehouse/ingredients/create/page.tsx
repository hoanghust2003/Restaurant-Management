'use client';

import React from 'react';
import IngredientForm from '@/app/components/ingredient/IngredientForm';
import { Card, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

const CreateIngredientPage: React.FC = () => {
  const router = useRouter();
  
  const handleSuccess = () => {
    router.push('/warehouse/ingredients');
  };
  
  return (
    <div className="p-6">
      <Card>
        <Title level={4}>Thêm nguyên liệu mới</Title>
        <Text type="secondary" className="mb-4 block">
          Nhập thông tin để thêm nguyên liệu mới vào kho
        </Text>
        <IngredientForm 
          onSuccess={handleSuccess}
        />
      </Card>
    </div>
  );
};

export default CreateIngredientPage;
