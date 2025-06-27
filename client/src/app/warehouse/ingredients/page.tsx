'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  message, 
  Card, 
  Typography,
  Badge,
  Spin,
  Tooltip,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  WarningOutlined,
  ImportOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IngredientModel } from '@/app/models/ingredient.model';
import { ingredientService } from '@/app/services/ingredient.service';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title, Text } = Typography;

const IngredientList: React.FC = () => {
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
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
    } catch (error) {
      message.error('Không thể tải danh sách nguyên liệu');
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIngredients();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await ingredientService.delete(id);
      message.success('Xóa nguyên liệu thành công');
      fetchIngredients();
    } catch (error) {
      message.error('Không thể xóa nguyên liệu');
      console.error('Error deleting ingredient:', error);
    }
  };

  // Hàm xác nhận xóa để hiện cảnh báo trước khi xóa
  const confirmDelete = (ingredient: IngredientModel) => {
    Modal.confirm({
      title: 'Xác nhận xóa nguyên liệu',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa nguyên liệu <strong>{ingredient.name}</strong>?</p>
          {(ingredient.current_quantity || 0) > 0 && (
            <p className="text-red-600">
              <WarningOutlined /> Cảnh báo: Nguyên liệu này hiện có {ingredient.current_quantity} {ingredient.unit} trong kho. Xóa nguyên liệu sẽ ảnh hưởng đến việc quản lý kho.
            </p>
          )}
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDelete(ingredient.id),
    });
  };

  const getFilteredIngredients = () => {
    if (!searchText) return ingredients;
    
    return ingredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchText.toLowerCase()) ||
      ingredient.unit.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getStockStatusColor = (currentQty: number = 0, threshold: number) => {
    if (currentQty <= 0) return 'error';
    if (currentQty <= threshold) return 'warning';
    if (currentQty <= threshold * 1.2) return 'processing';
    return 'success';
  };

  const getStockStatusText = (currentQty: number = 0, threshold: number) => {
    if (currentQty <= 0) return 'Hết hàng';
    if (currentQty <= threshold) return 'Sắp hết';
    if (currentQty <= threshold * 1.2) return 'Thấp';
    return 'Đủ hàng';
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image',
      width: 80,
      render: (imageUrl: string | null) => (
        <ImageWithFallback
          src={imageUrl || '/images/default-ingredient.png'}
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
      title: (
        <span>
          Số lượng hiện tại
          <Tooltip title="Tổng số lượng từ các lô hàng còn khả dụng">
            <InfoCircleOutlined className="ml-1" />
          </Tooltip>
        </span>
      ),
      dataIndex: 'current_quantity',
      key: 'current_quantity',
      width: 180,
      sorter: (a: IngredientModel, b: IngredientModel) => {
        const qtyA = a.current_quantity || 0;
        const qtyB = b.current_quantity || 0;
        return qtyA - qtyB;
      },
      render: (qty: number | undefined, record: IngredientModel) => {
        const quantity = qty || 0;
        const status = getStockStatusColor(quantity, record.threshold);
        const text = getStockStatusText(quantity, record.threshold);
        
        return (
          <Space>
            <Badge status={status} text={`${quantity} ${record.unit}`} />
            {status !== 'success' && (
              <Tag color={status === 'error' ? 'red' : 'orange'}>
                {text}
              </Tag>
            )}
            <Tooltip title="Xem chi tiết lô hàng">
              <Button 
                type="link" 
                icon={<InfoCircleOutlined />} 
                onClick={() => router.push(`/warehouse/ingredients/${record.id}`)}
                size="small"
              />
            </Tooltip>
          </Space>
        );
      },
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
      title: 'Thao tác',
      key: 'action',
      width: 280,
      render: (_: unknown, record: IngredientModel) => (
        <Space>
          <Button 
            icon={<ImportOutlined />}
            onClick={() => router.push(`/warehouse/imports/create?ingredient=${record.id}`)}
          >
            Nhập kho
          </Button>
          <Button
            icon={<ExportOutlined />}
            disabled={(record.current_quantity || 0) <= 0}
            onClick={() => router.push(`/warehouse/exports/create?ingredient=${record.id}`)}
          >
            Xuất kho
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/warehouse/ingredients/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  if (loading && ingredients.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <div className="flex flex-col items-center justify-center h-64">
            <Spin size="large" />
            <span className="mt-3 text-gray-600">Đang tải danh sách nguyên liệu...</span>
          </div>
        </Card>
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
          <div className="mt-2 sm:mt-0 flex space-x-2">
            <Button 
              icon={<ReloadOutlined spin={refreshing} />} 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Làm mới
            </Button>
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
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>
        
        <Table 
          columns={columns} 
          dataSource={getFilteredIngredients()} 
          rowKey="id"
          loading={loading || refreshing}
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
    <>
      <IngredientList />
    </>
  );
}
