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
  Divider,
  Progress
} from 'antd';
import { 
  ArrowLeftOutlined, 
  FileDoneOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { batchService, exportService } from '@/app/services/warehouse.service';
import { BatchModel, ExportModel, ExportItemModel } from '@/app/models/warehouse.model';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface BatchDetailProps {
  params: Promise<{ id: string }>;
}

const BatchDetail: React.FC<BatchDetailProps> = ({ params }) => {
  const router = useRouter();
  const [batch, setBatch] = useState<BatchModel | null>(null);
  const [exports, setExports] = useState<ExportModel[]>([]);
  const [exportItems, setExportItems] = useState<ExportItemModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportsLoading, setExportsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string>('');

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setBatchId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (batchId) {
      fetchBatch();
    }
  }, [batchId]);

  const fetchBatch = async () => {
    try {
      setLoading(true);
      const data = await batchService.getById(batchId);
      setBatch(data);
      setError(null);
      fetchExportItems(batchId);
    } catch (err: any) {
      console.error('Error fetching batch:', err);
      setError(err.message || 'Không thể tải thông tin lô hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchExportItems = async (batchId: string) => {
    try {
      setExportsLoading(true);
      const items = await batchService.getExportItems(batchId);
      setExportItems(items);
      
      // Group items by export_id to get unique exports
      const exportsMap = new Map<string, ExportModel>();
      items.forEach(item => {
        if (item.export_id && !exportsMap.has(item.export_id)) {
          exportsMap.set(item.export_id, {
            id: item.export_id,
            items: []
          } as ExportModel);
        }
      });
      
      // If we have export IDs, fetch their details
      if (exportsMap.size > 0) {
        const exportIds = Array.from(exportsMap.keys());
        const exportsData = await Promise.all(
          exportIds.map(id => exportService.getById(id))
        );
        setExports(exportsData);
      }
    } catch (err: any) {
      console.error('Error fetching export items:', err);
      // Not showing this error to the user as it's not critical
    } finally {
      setExportsLoading(false);
    }
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'depleted':
        return 'default';
      case 'expired':
        return 'red';
      case 'damaged':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getBatchStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Khả dụng';
      case 'depleted':
        return 'Đã hết';
      case 'expired':
        return 'Hết hạn';
      case 'damaged':
        return 'Hư hỏng';
      default:
        return 'Không xác định';
    }
  };

  const isExpiringSoon = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    const expiry = moment(expiryDate);
    const today = moment();
    const daysUntilExpiry = expiry.diff(today, 'days');
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const getDaysUntilExpiry = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    const expiry = moment(expiryDate);
    const today = moment();
    return expiry.diff(today, 'days');
  };

  const getExpiryStatus = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry === null) return null;
    
    if (daysUntilExpiry < 0) {
      return (
        <div>
          <Tag color="red" icon={<ExclamationCircleOutlined />}>
            Đã hết hạn {Math.abs(daysUntilExpiry)} ngày
          </Tag>
        </div>
      );
    }
    
    if (daysUntilExpiry <= 7) {
      return (
        <div>
          <Tag color="orange" icon={<ExclamationCircleOutlined />}>
            Sắp hết hạn (còn {daysUntilExpiry} ngày)
          </Tag>
        </div>
      );
    }
    
    return (
      <div>
        <Tag color="green">
          Còn hạn (còn {daysUntilExpiry} ngày)
        </Tag>
      </div>
    );
  };

  const getUsagePercentage = (batch: BatchModel) => {
    if (batch.quantity === 0) return 0;
    return Math.round(((batch.quantity - batch.remaining_quantity) / batch.quantity) * 100);
  };

  const exportColumns = [
    {
      title: 'Mã phiếu xuất',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: (text: string, record: ExportModel) => (
        <Button 
          type="link" 
          onClick={() => router.push(`/warehouse/exports/${record.id}`)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'export_date',
      key: 'export_date',
      render: (date: Date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a: ExportModel, b: ExportModel) => 
        new Date(a.export_date).getTime() - new Date(b.export_date).getTime(),
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => {
        let color = 'blue';
        let text = 'Sử dụng';
        
        if (reason === 'expired') {
          color = 'red';
          text = 'Hết hạn';
        } else if (reason === 'damaged') {
          color = 'orange';
          text = 'Hư hỏng';
        } else if (reason === 'other') {
          color = 'purple';
          text = 'Khác';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_: any, record: ExportModel) => {
        // Find export item related to this batch
        const item = exportItems.find(item => 
          item.export_id === record.id && item.batch_id === params.id
        );
        
        if (!item || !batch) return 'N/A';
        
        return `${item.quantity.toLocaleString('vi-VN')} ${batch.ingredient?.unit || ''}`;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ExportModel) => (
        <Button 
          type="primary" 
          size="small" 
          onClick={() => router.push(`/warehouse/exports/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin lô hàng..." />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy lô hàng'}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => router.push('/warehouse/batches')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/warehouse/batches')}
          >
            Quay lại danh sách
          </Button>
          <Space>
            {batch.status === 'available' && batch.remaining_quantity > 0 && (
              <Button 
                type="primary"
                icon={<FileDoneOutlined />}
                onClick={() => router.push(`/warehouse/exports/create?batch=${batch.id}`)}
              >
                Xuất kho lô hàng này
              </Button>
            )}
          </Space>
        </div>

        <div className="mb-6">
          <Title level={3}>
            {batch.ingredient?.name || 'Không xác định'} - Lô #{batch.lot_number || batch.id.slice(0, 8)}
            <Badge 
              status={getBatchStatusColor(batch.status) as any} 
              text={getBatchStatusText(batch.status)} 
              className="ml-4"
            />
          </Title>
          <Text type="secondary">Chi tiết lô hàng</Text>
        </div>
        
        <div className="mb-6">
          <Card className="bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Text type="secondary">Tồn kho / Tổng số lượng</Text>
                <div className="text-2xl font-semibold mt-1">
                  {batch.remaining_quantity.toLocaleString('vi-VN')} / {batch.quantity.toLocaleString('vi-VN')} {batch.ingredient?.unit || ''}
                </div>
                <Progress 
                  percent={getUsagePercentage(batch)} 
                  status={batch.remaining_quantity === 0 ? "exception" : "active"} 
                  className="mt-2"
                />
              </div>
              
              <div>
                <Text type="secondary">Đơn giá</Text>
                <div className="text-2xl font-semibold mt-1">
                  {batch.unit_price.toLocaleString('vi-VN')} VNĐ / {batch.ingredient?.unit || 'đơn vị'}
                </div>
                <div className="mt-2 text-gray-500">
                  Tổng giá trị còn lại: {(batch.remaining_quantity * batch.unit_price).toLocaleString('vi-VN')} VNĐ
                </div>
              </div>
              
              <div>
                <Text type="secondary">Hạn sử dụng</Text>
                <div className="text-2xl font-semibold mt-1">
                  {batch.expiry_date ? moment(batch.expiry_date).format('DD/MM/YYYY') : 'Không có'}
                </div>
                {batch.expiry_date && getExpiryStatus(batch.expiry_date)}
              </div>
            </div>
          </Card>
        </div>
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Mã lô">{batch.lot_number || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Nguyên liệu">
            <Button 
              type="link" 
              onClick={() => router.push(`/warehouse/ingredients/${batch.ingredient_id}`)}
              style={{ padding: 0 }}
            >
              {batch.ingredient?.name || 'N/A'}
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp">
            <Button 
              type="link" 
              onClick={() => router.push(`/warehouse/suppliers/${batch.supplier_id}`)}
              style={{ padding: 0 }}
            >
              {batch.supplier?.name || 'N/A'}
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sản xuất">
            {batch.production_date ? moment(batch.production_date).format('DD/MM/YYYY') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Hạn sử dụng">
            {batch.expiry_date ? moment(batch.expiry_date).format('DD/MM/YYYY') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Badge 
              status={getBatchStatusColor(batch.status) as any} 
              text={getBatchStatusText(batch.status)} 
            />
          </Descriptions.Item>
          <Descriptions.Item label="Đơn nhập kho">
            <Button 
              type="link" 
              onClick={() => router.push(`/warehouse/imports/${batch.import_id}`)}
              style={{ padding: 0 }}
            >
              Xem đơn nhập kho
            </Button>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập kho">
            {moment(batch.created_at).format('DD/MM/YYYY')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Tabs defaultActiveKey="history">
          <TabPane 
            tab={
              <span>
                <HistoryOutlined />
                Lịch sử xuất kho
              </span>
            } 
            key="history"
          >
            <div className="mb-4">
              <Text>Danh sách các lần xuất kho của lô hàng này</Text>
            </div>
            
            <Table 
              columns={exportColumns} 
              dataSource={exports} 
              rowKey="id"
              loading={exportsLoading}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lần xuất kho`,
              }}
              locale={{ emptyText: 'Chưa có lần xuất kho nào' }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default BatchDetail;
