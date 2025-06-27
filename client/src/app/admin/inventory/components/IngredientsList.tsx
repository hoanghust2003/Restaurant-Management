'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  Input, 
  Alert,
  Badge
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { IngredientModel } from '@/app/models/ingredient.model';
import { useAdminInventory } from '@/app/contexts/AdminInventoryContext';

const { Title } = Typography;

const IngredientsList: React.FC = () => {
  const router = useRouter();
  const { ingredients, loading, error } = useAdminInventory();
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<IngredientModel[]>([]);

  useEffect(() => {
    if (ingredients) {
      setFilteredData(
        ingredients.filter(item =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [ingredients, searchText]);

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: '10%',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'current_quantity',
      key: 'current_quantity',
      width: '15%',
      render: (currentQuantity: number, record: IngredientModel) => {
        const quantity = currentQuantity || 0;
        const threshold = record.threshold || 10;
        let color = 'green';
        let status = 'Đủ hàng';
        
        if (quantity <= 0) {
          color = 'red';
          status = 'Hết hàng';
        } else if (quantity <= threshold) {
          color = 'orange';
          status = 'Sắp hết';
        }
        
        return (
          <Space direction="vertical" size={0}>
            <Tag color={color}>
              {quantity} {record.unit}
            </Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>{status}</span>
          </Space>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: '15%',
      render: (active: boolean) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? 'Đang dùng' : 'Ngưng dùng'} 
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: IngredientModel) => (
        <Space size="middle">
          <Button 
            type="link"
            onClick={() => router.push(`/admin/inventory/ingredients/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Title level={4}>Danh sách nguyên liệu</Title>
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/inventory/ingredients/create')}
          >
            Thêm mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          total: filteredData.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} nguyên liệu`,
        }}
      />
    </Card>
  );
};

export default IngredientsList;
