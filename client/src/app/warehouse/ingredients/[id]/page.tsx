'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  Typography, 
  Spin, 
  Alert, 
  Button, 
  Descriptions, 
  Badge, 
  Tabs, 
  Table, 
  Tag, 
  Space, 
  Divider 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  ExportOutlined 
} from '@ant-design/icons';
import { ingredientService } from '@/app/services/ingredient.service';
import { batchService } from '@/app/services/warehouse.service';
import { IngredientModel } from '@/app/models/ingredient.model';
import { BatchModel } from '@/app/models/warehouse.model';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const IngredientDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ingredient, setIngredient] = useState<IngredientModel | null>(null);
  const [batches, setBatches] = useState<BatchModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [batchesLoading, setBatchesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIngredient = async () => {
      try {
        setLoading(true);
        const data = await ingredientService.getById(params.id);
        setIngredient(data);
        setError(null);
        
        // After fetching ingredient, fetch batches
        fetchBatches(data.id);
      } catch (err: any) {
        console.error('Error fetching ingredient:', err);
        setError(err.message || 'Không thể tải thông tin nguyên liệu');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchIngredient();
    }
  }, [params.id]);

  const fetchBatches = async (ingredientId: string) => {
    try {
      setBatchesLoading(true);
      const data = await batchService.getAll({ ingredient_id: ingredientId });
      setBatches(data);
    } catch (err: any) {
      console.error('Error fetching batches:', err);
      // We don't set the main error since this is secondary data
    } finally {
      setBatchesLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/warehouse/ingredients/edit/${params.id}`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa nguyên liệu "${ingredient?.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ingredientService.delete(params.id);
          message.success('Đã xóa nguyên liệu thành công');
          router.push('/warehouse/ingredients');
        } catch (err: any) {
          message.error(`Lỗi: ${err.message || 'Không thể xóa nguyên liệu'}`);
        }
      },
    });
  };

  const handleImport = () => {
    router.push(`/warehouse/imports/create?ingredient=${params.id}`);
  };

  const handleExport = () => {
    router.push(`/warehouse/exports/create?ingredient=${params.id}`);
  };

  const batchesColumns = [
    {
      title: 'Mã lô',
      dataIndex: 'lot_number',
      key: 'lot_number',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Số lượng còn lại',
      dataIndex: 'remaining_quantity',
      key: 'remaining_quantity',
      render: (quantity: number, record: BatchModel) => (
        <span>{quantity} {ingredient?.unit}</span>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: number) => (
        <span>{price.toLocaleString('vi-VN')} VND</span>
      ),
    },
    {
      title: 'Ngày sản xuất',
      dataIndex: 'production_date',
      key: 'production_date',
      render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => {
        if (!date) return 'N/A';
        
        const expiryDate = moment(date);
        const now = moment();
        const daysToExpiry = expiryDate.diff(now, 'days');
        
        let color = 'green';
        if (daysToExpiry <= 0) {
          color = 'red';
        } else if (daysToExpiry <= 30) {
          color = 'orange';
        }
        
        return (
          <Tag color={color}>
            {expiryDate.format('DD/MM/YYYY')}
            {daysToExpiry > 0 && ` (còn ${daysToExpiry} ngày)`}
            {daysToExpiry <= 0 && ' (đã hết hạn)'}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        let text = 'Có sẵn';
        
        switch (status) {
          case 'depleted':
            color = 'default';
            text = 'Đã hết';
            break;
          case 'expired':
            color = 'red';
            text = 'Hết hạn';
            break;
          case 'damaged':
            color = 'volcano';
            text = 'Hư hỏng';
            break;
        }
        
        return <Badge status={color as any} text={text} />;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: BatchModel) => (
        <Button 
          size="small"
          onClick={() => router.push(`/warehouse/batches/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin nguyên liệu..." />
      </div>
    );
  }

  if (error || !ingredient) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy thông tin nguyên liệu'}
          type="error"
          showIcon
          action={
            <Button 
              onClick={() => router.push('/warehouse/ingredients')}
            >
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  // Determine badge color based on stock level
  const getStockStatus = () => {
    const currentQuantity = ingredient.current_quantity || 0;
    const threshold = ingredient.threshold;
    
    if (currentQuantity <= 0) {
      return { status: 'error', text: 'Hết hàng' };
    } else if (currentQuantity <= threshold) {
      return { status: 'warning', text: 'Sắp hết' };
    } else if (currentQuantity <= threshold * 1.5) {
      return { status: 'processing', text: 'Thấp' };
    } else {
      return { status: 'success', text: 'Đủ hàng' };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <div className="p-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/warehouse/ingredients')}
              className="mr-4"
            >
              Quay lại
            </Button>
            <div>
              <Title level={4}>{ingredient.name}</Title>
              <Text type="secondary">Chi tiết nguyên liệu</Text>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Space>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />} 
                onClick={handleImport}
              >
                Nhập kho
              </Button>
              <Button 
                icon={<ExportOutlined />} 
                onClick={handleExport}
              >
                Xuất kho
              </Button>
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={handleDelete}
              >
                Xóa
              </Button>
            </Space>
          </div>
        </div>
        
        <div className="md:flex gap-8">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <div className="mb-4">
              <ImageWithFallback
                src={ingredient.image_url || '/images/ingredient-placeholder.png'}
                alt={ingredient.name}
                width={300}
                height={300}
                className="rounded-md object-cover w-full"
              />
            </div>
            
            <Card title="Tồn kho hiện tại" className="mb-4">
              <div className="text-center">
                <Title level={2}>{ingredient.current_quantity || 0}</Title>
                <Text>{ingredient.unit}</Text>
                <div className="mt-2">
                  <Badge status={stockStatus.status as any} text={stockStatus.text} />
                </div>
              </div>
              <Divider />
              <Descriptions layout="vertical" column={1} size="small">
                <Descriptions.Item label="Ngưỡng cảnh báo">
                  {ingredient.threshold} {ingredient.unit}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {ingredient.created_at 
                    ? moment(ingredient.created_at).format('DD/MM/YYYY') 
                    : 'N/A'
                  }
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
          
          <div className="md:w-2/3">
            <Tabs defaultActiveKey="batches">
              <TabPane tab="Lô hàng" key="batches">
                <div className="mb-4">
                  <Text>Danh sách các lô hàng của nguyên liệu này</Text>
                </div>
                <Table
                  columns={batchesColumns}
                  dataSource={batches}
                  rowKey="id"
                  loading={batchesLoading}
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 'max-content' }}
                />
              </TabPane>
              <TabPane tab="Lịch sử" key="history">
                <div className="mb-4">
                  <Text>Lịch sử nhập xuất kho của nguyên liệu này</Text>
                </div>
                <p>Chức năng đang được phát triển...</p>
              </TabPane>
              <TabPane tab="Thống kê" key="stats">
                <div className="mb-4">
                  <Text>Thống kê sử dụng nguyên liệu</Text>
                </div>
                <p>Chức năng đang được phát triển...</p>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IngredientDetail;
