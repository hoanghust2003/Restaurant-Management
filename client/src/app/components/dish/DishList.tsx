'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Input, Typography, Tag, Image } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { dishService } from '@/app/services/dish.service';
import { DishModel } from '@/app/models/dish.model';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { usePerformanceMonitor } from '@/app/utils/performanceMonitoring';

const { Title } = Typography;
const { Search } = Input;

/**
 * Component to display the list of dishes
 */
const DishList: React.FC = () => {
  const [dishes, setDishes] = useState<DishModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { user, hasRole } = useAuth();
  const router = useRouter();

  // Check if user has admin rights
  const canManageDishes = hasRole(['admin', 'chef']);

  // Monitor component performance
  usePerformanceMonitor('DishList', [dishes, loading, searchText]);

  // Fetch dishes
  const fetchDishes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dishService.getAll();
      setDishes(data);
    } catch (error) {
      console.error('Error loading dish list:', error);
      message.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load dishes when component mounts
  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  // Handle search filtering
  const filteredDishes = dishes.filter(
    dish => dish.name.toLowerCase().includes(searchText.toLowerCase()) ||
    dish.description.toLowerCase().includes(searchText.toLowerCase()) ||
    (dish.category?.name && dish.category.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Handle navigate to add dish page
  const handleAddDish = () => {
    router.push('/admin/dishes/add');
  };

  // Handle navigate to edit dish page
  const handleEditDish = (id: string) => {
    router.push(`/admin/dishes/edit/${id}`);
  };

  // Handle navigate to view dish page
  const handleViewDish = (id: string) => {
    router.push(`/admin/dishes/view/${id}`);
  };

  // Handle dish deletion
  const handleDeleteDish = async (id: string) => {
    try {
      await dishService.delete(id);
      message.success('Xóa món ăn thành công');
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      message.error('Không thể xóa món ăn');
    }
  };

  // Format price to VND currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Table columns
  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,
      render: (imageUrl: string) => (
        imageUrl ? (
          <Image
            src={imageUrl}
            alt="Dish"
            width={80}
            height={80}
            style={{ objectFit: 'cover' }}
            fallback="/images/default-dish.png"
          />
        ) : (
          <Image
            src="/images/default-dish.png"
            alt="Default"
            width={80}
            height={80}
          />
        )
      ),
    },
    {
      title: 'Tên món',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DishModel, b: DishModel) => a.name.localeCompare(b.name),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (_: any, record: DishModel) => record.category?.name || 'Chưa phân loại',
      sorter: (a: DishModel, b: DishModel) => 
        (a.category?.name || '').localeCompare(b.category?.name || ''),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
      sorter: (a: DishModel, b: DishModel) => a.price - b.price,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: DishModel) => (
        <Space>
          {record.available ? (
            <Tag color="green">Có sẵn</Tag>
          ) : (
            <Tag color="red">Hết hàng</Tag>
          )}
          {record.is_preparable ? (
            <Tag color="blue">Cần chế biến</Tag>
          ) : (
            <Tag color="orange">Không cần chế biến</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Thời gian chế biến',
      dataIndex: 'preparation_time',
      key: 'preparation_time',
      render: (time: number) => `${time} phút`,
      sorter: (a: DishModel, b: DishModel) => a.preparation_time - b.preparation_time,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: DishModel) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDish(record.id)}
          />
          {canManageDishes && (
            <>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={() => handleEditDish(record.id)}
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa món ăn này?"
                onConfirm={() => handleDeleteDish(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="dish-list">
      <div className="dish-list-header" style={{ marginBottom: 20 }}>
        <Title level={2}>Quản lý món ăn</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm món ăn"
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {canManageDishes && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddDish}
            >
              Thêm món ăn
            </Button>
          )}
        </div>
      </div>
      <Table
        dataSource={filteredDishes}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} món ăn`,
          defaultPageSize: 10,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />
    </div>
  );
};

export default DishList;
