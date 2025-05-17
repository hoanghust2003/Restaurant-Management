'use client';

import React from 'react';
import { Card } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CategoryModel } from '@/app/models/category.model';

interface CategoryCardProps {
  category: CategoryModel;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  return (
    <Card
      hoverable
      actions={[
        <EditOutlined key="edit" onClick={() => onEdit(category.id)} />,
        <DeleteOutlined key="delete" onClick={() => onDelete(category.id)} />
      ]}
    >
      <Card.Meta
        title={category.name}
        description={
          <div>
            <p className="text-gray-600 line-clamp-2">{category.description || 'Không có mô tả'}</p>
          </div>
        }
      />    </Card>
  );
};

export default CategoryCard;
