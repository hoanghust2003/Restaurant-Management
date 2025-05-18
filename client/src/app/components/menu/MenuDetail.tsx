'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Table, Button, Space, Spin, message, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { menuService } from '@/app/services/menu.service';
import { MenuModel } from '@/app/models/menu.model';
import { DishModel } from '@/app/models/dish.model';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from 'next/image';

const { Title, Text } = Typography;

interface MenuDetailProps {
  menuId: string;
}

const MenuDetail: React.FC<MenuDetailProps> = ({ menuId }) => {
  const [menu, setMenu] = useState<MenuModel | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { hasRole } = useAuth();

  // Check if user has edit permissions
  const canEdit = hasRole(['admin', 'chef']);

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const data = await menuService.getById(menuId);
        setMenu(data);
      } catch (error) {
        console.error(`Error loading menu ${menuId}:`, error);
        message.error('Không thể tải thông tin thực đơn');
        router.push('/admin/menus');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuId, router]);

  // Handle navigation back to menu list
  const handleBack = () => {
    router.push('/admin/menus');
  };

  // Handle navigation to edit page
  const handleEdit = () => {
    router.push(`/admin/menus/edit/${menuId}`);
  };

  // Define dish table columns
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl: string) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Món ăn"
            width={50}
            height={50}
            className="object-cover rounded-md"
          />
        ) : (
          <div className="w-[50px] h-[50px] bg-gray-200 rounded-md flex items-center justify-center">
            <Text type="secondary">No image</Text>
          </div>
        )
      )
    },
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Thời gian chuẩn bị',
      dataIndex: 'preparationTime',
      key: 'preparationTime',
      render: (time: number) => `${time} phút`
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="p-6">
        <Empty 
          description="Không tìm thấy thực đơn" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <div className="flex justify-center mt-4">
          <Button type="primary" onClick={handleBack}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            Chi tiết thực đơn
          </Title>
        </Space>
        {canEdit && (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={handleEdit}
          >
            Chỉnh sửa
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <Descriptions title="Thông tin chung" bordered column={1}>
          <Descriptions.Item label="Tên thực đơn">{menu.name}</Descriptions.Item>
          <Descriptions.Item label="Mô tả">{menu.description}</Descriptions.Item>
          <Descriptions.Item label="Số lượng món ăn">
            {menu.dishes ? menu.dishes.length : 0}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Danh sách món ăn trong thực đơn">
        {menu.dishes && menu.dishes.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={menu.dishes} 
            rowKey="id"
            pagination={false}
          />
        ) : (
          <Empty description="Không có món ăn nào trong thực đơn này" />
        )}
      </Card>
    </div>
  );
};

export default MenuDetail;
