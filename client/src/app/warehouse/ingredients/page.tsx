'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Popconfirm, 
  message, 
  Tooltip, 
  Card, 
  Typography,
  Dropdown,
  Menu,
  Spin,
  Alert,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  FilterOutlined,
  SortAscendingOutlined,
  WarningOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IngredientModel } from '@/app/models/ingredient.model';
import { ingredientService } from '@/app/services/ingredient.service';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import WarehouseLayout from '@/app/layouts/WarehouseLayout';

const { Title, Text } = Typography;

const IngredientList: React.FC = () => {
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientService.getAll();
      setIngredients(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching ingredients:', err);
      setError(err.message || 'Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await ingredientService.delete(id);
      message.success('Đã xóa nguyên liệu thành công');
      fetchIngredients();
    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể xóa nguyên liệu'}`);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const getFilteredIngredients = () => {
    if (!searchText) return ingredients;
    
    return ingredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchText.toLowerCase()) ||
      ingredient.unit.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image',
      width: 80,
      render: (imageUrl: string | null) => (
        <ImageWithFallback
          src={imageUrl || '/images/ingredient-placeholder.png'}
          alt="Ingredient"
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
      ),
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: IngredientModel, b: IngredientModel) => a.name.localeCompare(b.name),
      render: (text: string, record: IngredientModel) => (
        <Link href={`/warehouse/ingredients/${record.id}`}>
          <span className="font-medium text-blue-600 hover:text-blue-800">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
    },
    {
      title: 'Ngưỡng cảnh báo',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 150,
      render: (threshold: number, record: IngredientModel) => {
        const currentQty = record.current_quantity || 0;
        let color = 'green';
        let icon = null;
        
        if (currentQty <= threshold) {
          color = 'red';
          icon = <WarningOutlined />;
        } else if (currentQty <= threshold * 1.2) {
          color = 'orange';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {threshold} {record.unit}
          </Tag>
        );
      },
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'current_quantity',
      key: 'current_quantity',
      width: 150,
      sorter: (a: IngredientModel, b: IngredientModel) => {
        const qtyA = a.current_quantity || 0;
        const qtyB = b.current_quantity || 0;
        return qtyA - qtyB;
      },
      render: (qty: number | undefined, record: IngredientModel) => {
        const quantity = qty || 0;
        const threshold = record.threshold;
        let color = 'green';
        
        if (quantity <= threshold) {
          color = 'red';
        } else if (quantity <= threshold * 1.2) {
          color = 'orange';
        }
        
        return (
          <Tag color={color}>
            {quantity} {record.unit}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      render: (_: any, record: IngredientModel) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => router.push(`/warehouse/ingredients/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Nhập kho">
            <Button 
              type="primary" 
              size="small"
              onClick={() => router.push(`/warehouse/imports/create?ingredient=${record.id}`)}
            >
              Nhập kho
            </Button>
          </Tooltip>
          <Dropdown
            overlay={
              <Menu items={[
                {
                  key: '1',
                  label: 'Xuất kho',
                  onClick: () => router.push(`/warehouse/exports/create?ingredient=${record.id}`),
                },
                {
                  key: '2',
                  label: 'Xem lịch sử',
                  onClick: () => router.push(`/warehouse/ingredients/${record.id}/history`),
                },
                {
                  key: '3',
                  label: 'Xóa',
                  danger: true,
                  onClick: () => {
                    // Using Popconfirm directly in dropdown doesn't work well, so we use message.confirm
                    Modal.confirm({
                      title: 'Xác nhận xóa',
                      content: `Bạn có chắc chắn muốn xóa nguyên liệu "${record.name}"?`,
                      okText: 'Xóa',
                      okType: 'danger',
                      cancelText: 'Hủy',
                      onOk: () => handleDelete(record.id),
                    });
                  },
                },
              ]} 
            />
            }
            trigger={['click']}
          >
            <Button size="small" icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách nguyên liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <Title level={4}>Quản lý nguyên liệu</Title>
            <Text type="secondary">Danh sách các nguyên liệu trong kho</Text>
          </div>
          <div className="mt-2 sm:mt-0">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => router.push('/warehouse/ingredients/create')}
            >
              Thêm nguyên liệu
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <Input 
            placeholder="Tìm kiếm theo tên hoặc đơn vị" 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
        </div>
        
        <Table 
          columns={columns} 
          dataSource={getFilteredIngredients()} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nguyên liệu`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default function IngredientsPage() {
  return (
    <WarehouseLayout title="Nguyên liệu">
      <IngredientList />
    </WarehouseLayout>
  );
}
