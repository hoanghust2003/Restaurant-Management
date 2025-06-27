'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Card, Typography, Tag, message, Popconfirm } from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  ExportOutlined, 
  ImportOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { IngredientModel } from '@/app/models/ingredient.model';
import { ingredientService } from '@/app/services/ingredient.service';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title } = Typography;

const IngredientList = () => {
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientService.getAll();
      
      // Backend đã tính toán sẵn current_quantity dựa trên tổng remaining_quantity 
      // từ tất cả các lô available và chưa hết hạn - không cần tính toán lại
      setIngredients(data.map(ingredient => ({
        ...ingredient,
        current_quantity: ingredient.current_quantity || 0
      })));
    } catch (error: unknown) {
      console.error('Error fetching ingredients:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  // Lọc nguyên liệu theo từ khóa tìm kiếm
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchText.toLowerCase()) ||
    ingredient.unit.toLowerCase().includes(searchText.toLowerCase())
  );

  // Cột cho bảng
  const columns = [
    {
      title: 'Ảnh',
      key: 'image',
      width: 90,
      render: (_: unknown, record: IngredientModel) => (
        <ImageWithFallback
          src={record.image_url}
          type="ingredients"
          alt={record.name}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: IngredientModel, b: IngredientModel) => a.name.localeCompare(b.name),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
    },
    {
      title: 'Số lượng hiện tại',
      dataIndex: 'current_quantity',
      key: 'current_quantity',
      width: 150,
      render: (quantity: number | undefined, record: IngredientModel) => {
        const currentQty = quantity || 0;
        const threshold = record.threshold;
        let color = 'success';
        let status = 'Đủ';

        if (currentQty <= threshold) {
          color = 'error';
          status = 'Thiếu';
        } else if (currentQty <= threshold * 1.2) {
          color = 'warning';
          status = 'Sắp thiếu';
        }

        return (
          <Space>
            <span>{currentQty} {record.unit}</span>
            <Tag color={color}>{status}</Tag>
          </Space>
        );
      },
    },
    {
      title: 'Ngưỡng cảnh báo',
      dataIndex: 'threshold',
      key: 'threshold',
      width: 150,
      render: (threshold: number, record: IngredientModel) => (
        <span>{threshold} {record.unit}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 300,
      render: (_: unknown, record: IngredientModel) => (
        <Space>
          <Button 
            type="primary"
            icon={<ImportOutlined />}
            onClick={() => router.push(`/admin/inventory/imports/create?ingredient=${record.id}`)}
          >
            Nhập kho
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={() => router.push(`/admin/inventory/exports/create?ingredient=${record.id}`)}
          >
            Xuất kho
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/inventory/ingredients/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa nguyên liệu này?"
            description="Bạn có chắc chắn muốn xóa nguyên liệu này không?"
            onConfirm={() => handleDeleteIngredient(record.id)}
            okText="Có"
            cancelText="Không"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Xử lý sự kiện xóa nguyên liệu
  const handleDeleteIngredient = async (id: string) => {
    try {
      await ingredientService.delete(id);
      message.success('Xóa nguyên liệu thành công');
      fetchIngredients(); // Refresh danh sách sau khi xóa
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      message.error('Không thể xóa nguyên liệu');
    }
  };

  return (
    <Card>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>Danh sách nguyên liệu</Title>
        <Space>
          <Input
            placeholder="Tìm kiếm nguyên liệu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/inventory/ingredients/create')}
          >
            Thêm nguyên liệu
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filteredIngredients}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} nguyên liệu`,
        }}
      />
    </Card>
  );
};

export default IngredientList;
