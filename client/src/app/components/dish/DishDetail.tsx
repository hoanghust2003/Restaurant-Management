'use client';

import React from 'react';
import { Card, Descriptions, Tag, Image, Typography, Divider, Table } from 'antd';
import { DishModel } from '@/app/models/dish.model';

const { Title } = Typography;

interface DishDetailProps {
  dish: DishModel;
}

/**
 * Component to display detailed information about a dish
 */
const DishDetail: React.FC<DishDetailProps> = ({ dish }) => {
  // Format price to VND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Columns for ingredients table
  const ingredientColumns = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: ['ingredient', 'name'],
      key: 'name',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => `${quantity} ${record.ingredient?.unit || ''}`,
    },
  ];

  return (
    <Card className="dish-detail-card">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 300px' }}>
            <Image
              src={dish.image_url || '/images/default-dish.png'}
              alt={dish.name}
              fallback="/images/default-dish.png"
              width={300}
              height={300}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <Title level={2}>{dish.name}</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Mô tả">{dish.description}</Descriptions.Item>
              <Descriptions.Item label="Giá">{formatPrice(dish.price)}</Descriptions.Item>
              <Descriptions.Item label="Danh mục">{dish.category?.name || 'Chưa phân loại'}</Descriptions.Item>
              <Descriptions.Item label="Thời gian chế biến">{dish.preparation_time} phút</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <div style={{ display: 'flex', gap: '8px' }}>
                  {dish.available ? (
                    <Tag color="green">Có sẵn</Tag>
                  ) : (
                    <Tag color="red">Hết hàng</Tag>
                  )}
                  {dish.is_preparable ? (
                    <Tag color="blue">Cần chế biến</Tag>
                  ) : (
                    <Tag color="orange">Không cần chế biến</Tag>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        {dish.dishIngredients && dish.dishIngredients.length > 0 && (
          <div>
            <Divider orientation="left">Nguyên liệu</Divider>
            <Table
              dataSource={dish.dishIngredients}
              columns={ingredientColumns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default DishDetail;
