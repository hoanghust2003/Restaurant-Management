'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/layouts/AdminLayout';
import {
  Card,
  Typography,
  Spin,
  Alert,
  Descriptions,
  Tag,
  Button,
  Space,
  Table,
  Row,
  Col,
  Statistic,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { exportService } from '@/app/services/warehouse.service';
import { ExportModel, ExportItemModel } from '@/app/models/warehouse.model';

const { Title, Text } = Typography;

interface ExportDetailPageProps {
  params: Promise<{ id: string }>;
}

const AdminExportDetailPage: React.FC<ExportDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const [exportData, setExportData] = useState<ExportModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportId, setExportId] = useState<string>('');

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setExportId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (exportId) {
      fetchExport();
    }
  }, [exportId]);

  const fetchExport = async () => {
    try {
      setLoading(true);
      const data = await exportService.getById(exportId);
      setExportData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching export:', err);
      setError(err.message || 'Không thể tải thông tin phiếu xuất');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getReasonTag = (reason: string) => {
    switch (reason) {
      case 'usage':
        return <Tag color="blue">Sử dụng</Tag>;
      case 'damaged':
        return <Tag color="orange">Hư hỏng</Tag>;
      case 'expired':
        return <Tag color="red">Hết hạn</Tag>;
      case 'other':
        return <Tag color="default">Khác</Tag>;
      default:
        return <Tag color="default">{reason}</Tag>;
    }
  };

  const calculateTotalValue = () => {
    if (!exportData?.items) return 0;
    
    return exportData.items.reduce((total, item) => {
      const batchPrice = item.batch?.unit_price || 0;
      return total + (item.quantity * batchPrice);
    }, 0);
  };

  const itemColumns = [
    {
      title: 'Nguyên liệu',
      dataIndex: 'ingredient',
      key: 'ingredient',
      render: (ingredient: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{ingredient?.name || 'N/A'}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {ingredient?.description || ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'Lô hàng',
      dataIndex: 'batch',
      key: 'batch',
      render: (batch: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {batch?.lot_number || `#${batch?.id?.substring(0, 8)}` || 'N/A'}
          </div>
          {batch?.expiry_date && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              HSD: {moment(batch.expiry_date).format('DD/MM/YYYY')}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Số lượng xuất',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: ExportItemModel) => (
        <div>
          <Text strong>{quantity.toLocaleString()}</Text>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.ingredient?.unit || ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'batch',
      key: 'unit_price',
      render: (batch: any) => (
        <div>
          <Text>{(batch?.unit_price || 0).toLocaleString()} ₫</Text>
          <div style={{ fontSize: '12px', color: '#666' }}>
            /{batch?.ingredient?.unit || 'đơn vị'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: any, record: ExportItemModel) => {
        const total = record.quantity * (record.batch?.unit_price || 0);
        return <Text strong>{total.toLocaleString()} ₫</Text>;
      },
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="Chi tiết phiếu xuất">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Đang tải thông tin phiếu xuất..." />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Chi tiết phiếu xuất">
        <div className="p-6">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button onClick={() => router.push('/admin/inventory/exports')}>
                Quay lại danh sách
              </Button>
            }
          />
        </div>
      </AdminLayout>
    );
  }

  if (!exportData) {
    return (
      <AdminLayout title="Chi tiết phiếu xuất">
        <div className="p-6">
          <Empty description="Không tìm thấy phiếu xuất" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chi tiết phiếu xuất">
      {/* Print Header - Hidden on screen */}
      <div className="print-only text-center mb-6" style={{ display: 'none' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
          PHIẾU XUẤT KHO
        </h1>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Mã phiếu: {exportData.reference_number}
        </p>
        <p style={{ margin: '0', fontSize: '12px' }}>
          Ngày in: {moment().format('DD/MM/YYYY HH:mm')}
        </p>
      </div>
      
      <div className="p-6">
        <Card className="shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-6 print-hidden">
            <div className="flex items-center">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.push('/admin/inventory/exports')}
                className="mr-4"
              >
                Quay lại
              </Button>
              <div>
                <Title level={4} className="mb-0">Chi tiết phiếu xuất kho</Title>
                <Text type="secondary">Mã phiếu: {exportData.reference_number}</Text>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Space>
                <Button 
                  icon={<PrinterOutlined />} 
                  onClick={handlePrint}
                  type="primary"
                  ghost
                >
                  In phiếu
                </Button>
              </Space>
            </div>
          </div>

          {/* Statistics Cards */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tổng nguyên liệu"
                  value={exportData.items?.length || 0}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tổng số lượng"
                  value={exportData.total_quantity || 0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Tổng giá trị"
                  value={calculateTotalValue()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  suffix="₫"
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small">
                <Statistic
                  title="Trạng thái"
                  value="Đã hoàn thành"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Export Information */}
          <Card size="small" title="Thông tin phiếu xuất" className="mb-4">
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item 
                label={<><CalendarOutlined className="mr-1" />Ngày xuất</>}
              >
                {moment(exportData.export_date).format('DD/MM/YYYY')}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<><UserOutlined className="mr-1" />Người tạo</>}
              >
                {exportData.created_by || 'N/A'}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<><HistoryOutlined className="mr-1" />Ngày tạo</>}
              >
                {moment(exportData.created_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<><FileTextOutlined className="mr-1" />Lý do xuất</>}
              >
                {getReasonTag(exportData.reason)}
              </Descriptions.Item>

              {exportData.notes && (
                <Descriptions.Item 
                  label="Ghi chú" 
                  span={2}
                >
                  {exportData.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Export Items */}
          <Card size="small" title="Chi tiết nguyên liệu xuất">
            <Table
              columns={itemColumns}
              dataSource={exportData.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              summary={(data) => {
                const totalQuantity = data.reduce((sum, record) => sum + record.quantity, 0);
                const totalValue = data.reduce((sum, record) => {
                  return sum + (record.quantity * (record.batch?.unit_price || 0));
                }, 0);

                return (
                  <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text strong>Tổng cộng</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong>{totalQuantity.toLocaleString()}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <Text type="secondary">-</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4}>
                      <Text strong style={{ color: '#fa8c16' }}>
                        {totalValue.toLocaleString()} ₫
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>

          {/* Footer */}
          <div className="mt-6 print-visible text-right" style={{ display: 'none' }}>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '50px' }}>Người lập phiếu</p>
                <p>________________________</p>
              </div>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '50px' }}>Thủ kho</p>
                <p>________________________</p>
              </div>
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '50px' }}>Người nhận</p>
                <p>________________________</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
          .print-visible, .print-only {
            display: block !important;
          }
          body {
            margin: 0;
            padding: 20px;
          }
          .ant-card {
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminExportDetailPage;
