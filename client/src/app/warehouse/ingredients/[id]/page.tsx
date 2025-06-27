/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import {  useRouter } from 'next/navigation';
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
  Divider,
  Modal,
  message,
  Statistic,
  Progress,
  Tooltip
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined, 
  ShoppingCartOutlined, 
  ExportOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { ingredientService } from '@/app/services/ingredient.service';
import { batchService } from '@/app/services/warehouse.service';
import { IngredientModel } from '@/app/models/ingredient.model';
import { BatchModel } from '@/app/models/warehouse.model';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface IngredientDetailProps {
  params: Promise<{ id: string }>;
}

const IngredientDetail: React.FC<IngredientDetailProps> = ({ params }) => {
  const router = useRouter();
  const [ingredient, setIngredient] = useState<IngredientModel | null>(null);
  const [batches, setBatches] = useState<BatchModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [batchesLoading, setBatchesLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredientId, setIngredientId] = useState<string>('');
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [availableBatches, setAvailableBatches] = useState<BatchModel[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<BatchModel[]>([]);

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setIngredientId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (ingredientId) {
      fetchData();
    }
  }, [ingredientId]);

  useEffect(() => {
    // Mỗi khi dữ liệu lô hàng thay đổi, tính toán lại số lượng
    calculateQuantities();
  }, [batches]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Tải dữ liệu nguyên liệu (đã bao gồm current_quantity được tính từ backend)
      const ingredientData = await ingredientService.getById(ingredientId);
      setIngredient(ingredientData);
      setTotalQuantity(ingredientData.current_quantity || 0);
      
      // Sau khi tải nguyên liệu, tải dữ liệu về các lô
      await fetchBatches(ingredientData.id);
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching ingredient:', err);
      setError(err.message || 'Không thể tải thông tin nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }

  const calculateQuantities = () => {
    // Tính toán các thống kê phụ từ dữ liệu lô hàng (để hiển thị)
    const available = batches.filter(batch => batch.status === 'available');
    setAvailableBatches(available);
    
    // Tính số lượng lô sắp hết hạn (30 ngày)
    const expiring = available.filter(batch => {
      if (!batch.expiry_date) return false;
      const expiryDate = moment(batch.expiry_date);
      const daysToExpiry = expiryDate.diff(moment(), 'days');
      return daysToExpiry >= 0 && daysToExpiry <= 30;
    });
    setExpiringBatches(expiring);
    
    // Không tự tính current_quantity nữa - sử dụng từ backend
  };

  const handleEdit = () => {
    router.push(`/warehouse/ingredients/edit/${ingredientId}`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa nguyên liệu <strong>{ingredient?.name}</strong>?</p>
          {totalQuantity > 0 && (
            <p className="text-red-600">
              <WarningOutlined /> Cảnh báo: Nguyên liệu này hiện có {totalQuantity} {ingredient?.unit} từ {availableBatches.length} lô trong kho. Xóa nguyên liệu sẽ ảnh hưởng đến việc quản lý kho.
            </p>
          )}
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await ingredientService.delete(ingredientId);
          message.success('Đã xóa nguyên liệu thành công');
          router.push('/warehouse/ingredients');
        } catch (err: any) {
          message.error(`Lỗi: ${err.message || 'Không thể xóa nguyên liệu'}`);
        }
      },
    });
  };

  const handleImport = () => {
    router.push(`/warehouse/imports/create?ingredient=${ingredientId}`);
  };

  const handleExport = () => {
    if (totalQuantity <= 0) {
      message.warning('Không có đủ số lượng để xuất kho');
      return;
    }
    router.push(`/warehouse/exports/create?ingredient=${ingredientId}`);
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
      sorter: (a: BatchModel, b: BatchModel) => a.remaining_quantity - b.remaining_quantity,
      render: (quantity: number, record: BatchModel) => (
        <span>{quantity} {ingredient?.unit}</span>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      sorter: (a: BatchModel, b: BatchModel) => a.unit_price - b.unit_price,
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
      sorter: (a: BatchModel, b: BatchModel) => {
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return moment(a.expiry_date).diff(moment(b.expiry_date));
      },
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
      filters: [
        { text: 'Có sẵn', value: 'available' },
        { text: 'Đã hết', value: 'depleted' },
        { text: 'Hết hạn', value: 'expired' },
        { text: 'Hư hỏng', value: 'damaged' }
      ],
      onFilter: (value: any, record: BatchModel) => record.status === value,
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
        <Space>
          <Button 
            size="small"
            onClick={() => router.push(`/warehouse/batches/${record.id}`)}
          >
            Chi tiết
          </Button>
          {record.status === 'available' && record.remaining_quantity > 0 && (
            <Button 
              size="small"
              type="primary"
              onClick={() => router.push(`/warehouse/exports/create?ingredient=${record.ingredient_id}`)}
            >
              Xuất kho
            </Button>
          )}
        </Space>
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
    const currentQuantity = totalQuantity;
    const threshold = ingredient.threshold;
    
    if (currentQuantity <= 0) {
      return { status: 'error', text: 'Hết hàng', percentage: 0 };
    } else if (currentQuantity <= threshold) {
      return { 
        status: 'warning', 
        text: 'Sắp hết', 
        percentage: Math.round((currentQuantity / threshold) * 100) 
      };
    } else if (currentQuantity <= threshold * 1.5) {
      return { 
        status: 'processing', 
        text: 'Thấp', 
        percentage: Math.round((currentQuantity / (threshold * 2)) * 100) 
      };
    } else {
      return { 
        status: 'success', 
        text: 'Đủ hàng', 
        percentage: Math.min(100, Math.round((currentQuantity / (threshold * 2)) * 100))
      };
    }
  };

  const stockStatus = getStockStatus();
  const progressColor = 
    stockStatus.status === 'error' ? '#f5222d' :
    stockStatus.status === 'warning' ? '#faad14' :
    stockStatus.status === 'processing' ? '#1890ff' : '#52c41a';

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
                icon={<ReloadOutlined spin={refreshing} />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Làm mới
              </Button>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />} 
                onClick={handleImport}
              >
                Nhập kho
              </Button>
              <Button 
                icon={<ExportOutlined />}
                disabled={totalQuantity <= 0}
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
                src={ingredient.image_url || '/images/default-ingredient.png'}
                alt={ingredient.name}
                width={300}
                height={300}
                className="rounded-md object-cover w-full"
              />
            </div>
            
            <Card title="Tồn kho hiện tại" className="mb-4" extra={
              <Tooltip title="Số lượng được tính từ tất cả các lô còn khả dụng">
                <InfoCircleOutlined />
              </Tooltip>
            }>
              <div className="text-center">
                <Statistic 
                  value={totalQuantity} 
                  suffix={ingredient.unit}
                  valueStyle={{ color: progressColor }} 
                />
                <div className="my-4">
                  <Progress 
                    percent={stockStatus.percentage} 
                    status={stockStatus.status === 'error' ? 'exception' : undefined}
                    strokeColor={progressColor}
                    showInfo={false}
                  />
                </div>
                <div className="mt-2">
                  <Badge status={stockStatus.status as any} text={stockStatus.text} />
                </div>
              </div>
              <Divider />
              <Descriptions layout="vertical" column={1} size="small">
                <Descriptions.Item label="Ngưỡng cảnh báo">
                  {ingredient.threshold} {ingredient.unit}
                </Descriptions.Item>
                <Descriptions.Item label="Số lô khả dụng">
                  {availableBatches.length} lô
                </Descriptions.Item>
                {expiringBatches.length > 0 && (
                  <Descriptions.Item label={
                    <span className="text-orange-500">
                      <WarningOutlined /> Sắp hết hạn
                    </span>
                  }>
                    {expiringBatches.length} lô
                  </Descriptions.Item>
                )}
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
                <div className="mb-4 flex justify-between items-center">
                  <Text>Danh sách các lô hàng của nguyên liệu này</Text>
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />}
                    onClick={handleImport}
                  >
                    Nhập lô mới
                  </Button>
                </div>
                <Table
                  columns={batchesColumns}
                  dataSource={batches}
                  rowKey="id"
                  loading={batchesLoading || refreshing}
                  pagination={{ pageSize: 10 }}
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
