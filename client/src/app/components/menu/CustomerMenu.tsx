'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Spin, Empty, Row, Col, Space, Image, Divider } from 'antd'; 
import { menuService } from '@/app/services/menu.service';
import { MenuModel } from '@/app/models/menu.model';
import { DishModel } from '@/app/models/dish.model';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title, Text } = Typography;

const CustomerMenu: React.FC = () => {
  const [menu, setMenu] = useState<MenuModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch main menu when component mounts
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const data = await menuService.getMain();
        setMenu(data);
        setError(null);
      } catch (error) {
        console.error('Error loading main menu:', error);
        setError('Không thể tải thực đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Format price to VND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Group dishes by category
  const groupDishesByCategory = (dishes: DishModel[]) => {
    return dishes.reduce((acc, dish) => {
      const categoryName = dish.category?.name || 'Khác';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(dish);
      return acc;
    }, {} as { [key: string]: DishModel[] });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Đang tải thực đơn..." />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="p-6">
        <Empty 
          description={error || "Không có thực đơn nào"} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  const groupedDishes = groupDishesByCategory(menu.dishes || []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Title level={2} className="text-center mb-8">
        {menu.name}
      </Title>
      
      <div className="mb-8">
        <Text className="text-lg text-gray-600">
          {menu.description}
        </Text>
      </div>

      {Object.entries(groupedDishes).map(([categoryName, dishes]) => (
        <div key={categoryName} className="mb-12">
          <Title level={3} className="mb-6">
            {categoryName}
          </Title>
          <Row gutter={[24, 24]}>
            {dishes.map((dish) => (
              <Col key={dish.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className="h-full"
                  cover={
                    <ImageWithFallback
                      src={dish.image_url}
                      type="dishes"
                      alt={dish.name}
                      width="100%"
                      height={200}
                      style={{ objectFit: 'cover' }}
                    />
                  }
                >
                  <Card.Meta
                    title={<Text strong>{dish.name}</Text>}
                    description={
                      <div>
                        <Text className="text-gray-500 line-clamp-2">
                          {dish.description}
                        </Text>
                        <div className="mt-2">
                          <Text type="danger" strong className="text-lg">
                            {formatPrice(dish.price)}
                          </Text>
                        </div>
                        <div className="mt-2">
                          <Space>
                            {!dish.available && (
                              <Tag color="red">Hết hàng</Tag>
                            )}
                            {dish.is_preparable && (
                              <Tag color="blue">
                                {dish.preparation_time} phút
                              </Tag>
                            )}
                          </Space>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Divider />
        </div>
      ))}
    </div>
  );
};

export default CustomerMenu;
