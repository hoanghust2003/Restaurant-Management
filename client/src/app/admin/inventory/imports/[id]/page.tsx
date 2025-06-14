'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Avatar,
  List,
  Row,
  Col,
  Statistic,
  Divider,
  Timeline,
  Progress,
  Tooltip,
  Badge,
  Image,
  Empty,
  message,
  Modal,
  Tabs
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BarcodeOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { importService } from '@/app/services/warehouse.service';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface ImportDetailPageProps {}

const ImportDetailPage: React.FC<ImportDetailPageProps> = () => {
  const router = useRouter();
  const params = useParams();
  const importId = params?.id as string;

  const [importData, setImportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (importId) {
      fetchImportDetail();
    }
  }, [importId]);

  const fetchImportDetail = async () => {
    try {
      setLoading(true);
      const data = await importService.getById(importId);
      setImportData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching import detail:', err);
      setError(err.message || 'Không thể tải chi tiết phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  const calculateBatchesUsage = (batches: any[]) => {
    if (!batches || batches.length === 0) return 0;
    
    const totalOriginal = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const totalRemaining = batches.reduce((sum, batch) => sum + batch.remaining_quantity, 0);
    
    return totalOriginal > 0 ? ((totalOriginal - totalRemaining) / totalOriginal) * 100 : 0;
  };

  const getImportStatus = (importItem: any) => {
    if (!importItem.batches || importItem.batches.length === 0) {
      return { status: 'empty', text: 'Không có lô hàng', color: 'default' };
    }
    
    const usage = calculateBatchesUsage(importItem.batches);
    
    if (usage === 0) {
      return { status: 'new', text: 'Mới', color: 'blue' };
    } else if (usage < 50) {
      return { status: 'in_use', text: 'Đang sử dụng', color: 'green' };
    } else if (usage < 100) {
      return { status: 'mostly_used', text: 'Gần hết', color: 'orange' };
    } else {
      return { status: 'depleted', text: 'Đã hết', color: 'red' };
    }
  };

  const handlePrint = () => {
    window.print();
  };
  const handleEdit = () => {
    message.info('Tính năng chỉnh sửa sẽ được triển khai sau');
    // router.push(`/admin/inventory/imports/${importId}/edit`);
  };
  const handleDelete = () => {
    Modal.confirm({
      title: 'Xác nhận xóa phiếu nhập',
      content: 'Bạn có chắc chắn muốn xóa phiếu nhập này không? Hành động này có thể ảnh hưởng đến các lô hàng đã được sử dụng.',
      icon: <ExclamationCircleOutlined />,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          // await importService.delete(importId);
          message.success('Tính năng xóa sẽ được triển khai sau');
          // router.push('/admin/inventory/imports');
        } catch (err: any) {
          message.error(err.message || 'Không thể xóa phiếu nhập');
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết phiếu nhập">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Chi tiết phiếu nhập">
        <div className="p-6">
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => router.push('/admin/inventory/imports')}>
                Quay lại danh sách
              </Button>
            }
          />
        </div>
      </AdminLayout>
    );
  }

  if (!importData) {
    return (
      <AdminLayout title="Chi tiết phiếu nhập">
        <div className="p-6">
          <Empty description="Không tìm thấy phiếu nhập" />
        </div>
      </AdminLayout>
    );
  }

  const status = getImportStatus(importData);
  const usage = calculateBatchesUsage(importData.batches);
  const expiringBatches = importData.batches?.filter((batch: any) => 
    moment(batch.expiry_date).isBefore(moment().add(30, 'days'))
  ) || [];

  return (
    <AdminLayout title={`Phiếu nhập #${importData.id.substring(0, 8)}`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/admin/inventory/imports')}
            >
              Quay lại
            </Button>
            <div>
              <Title level={3} className="mb-1">
                Phiếu nhập #{importData.id.substring(0, 8)}
              </Title>
              <div className="flex items-center space-x-3">
                <Tag color={status.color} className="mb-0">
                  {status.text}
                </Tag>
                <Text type="secondary">
                  Tạo lúc {moment(importData.created_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </div>
          </div>

          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              In phiếu
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
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

        {/* Warning for expiring batches */}
        {expiringBatches.length > 0 && (
          <Alert
            message={`Cảnh báo: ${expiringBatches.length} lô hàng sắp hết hạn`}
            description="Các lô hàng này sẽ hết hạn trong vòng 30 ngày tới. Vui lòng kiểm tra và sử dụng sớm."
            type="warning"
            showIcon
            className="mb-6"
          />
        )}

        {/* Statistics Row */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng giá trị"
                value={importData.total_value}
                formatter={(value) => `${(value as number).toLocaleString('vi-VN')} ₫`}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Số lô hàng"
                value={importData.batches?.length || 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
                suffix="lô"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Mức sử dụng"
                value={usage}
                precision={1}
                suffix="%"
                prefix={<LineChartOutlined />}
                valueStyle={{ 
                  color: usage === 0 ? '#1890ff' :
                        usage < 50 ? '#52c41a' :
                        usage < 100 ? '#faad14' : '#ff4d4f'
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Lô sắp hết hạn"
                value={expiringBatches.length}
                prefix={<WarningOutlined />}
                valueStyle={{ color: expiringBatches.length > 0 ? '#ff4d4f' : '#52c41a' }}
                suffix="lô"
              />
            </Card>
          </Col>
        </Row>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin chi tiết" key="1">
            <Row gutter={24}>
              {/* Basic Information */}
              <Col xs={24} lg={12}>
                <Card title="Thông tin cơ bản" className="h-full">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="ID Phiếu nhập">
                      <Text copyable className="font-mono">
                        {importData.id}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      <div className="flex items-center space-x-2">
                        <CalendarOutlined />
                        <span>{moment(importData.created_at).format('DD/MM/YYYY HH:mm:ss')}</span>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người tạo">
                      <div className="flex items-center space-x-2">
                        <Avatar 
                          size="small" 
                          src={importData.created_by?.avatar_url} 
                          icon={<UserOutlined />}
                        />
                        <span>{importData.created_by?.name}</span>
                        <Tag>{importData.created_by?.role}</Tag>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag color={status.color}>{status.text}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">
                      {importData.note ? (
                        <Paragraph>{importData.note}</Paragraph>
                      ) : (
                        <Text type="secondary" italic>Không có ghi chú</Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {/* Supplier Information */}
              <Col xs={24} lg={12}>
                <Card title="Thông tin nhà cung cấp" className="h-full">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tên nhà cung cấp">
                      <Text strong>{importData.supplier?.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người liên hệ">
                      <div className="flex items-center space-x-2">
                        <UserOutlined />
                        <span>{importData.supplier?.contact_name}</span>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">
                      <div className="flex items-center space-x-2">
                        <PhoneOutlined />
                        <Text copyable>{importData.supplier?.contact_phone}</Text>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <div className="flex items-center space-x-2">
                        <MailOutlined />
                        <Text copyable>{importData.supplier?.contact_email}</Text>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">
                      <div className="flex items-center space-x-2">
                        <EnvironmentOutlined />
                        <span>{importData.supplier?.address}</span>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={`Lô hàng (${importData.batches?.length || 0})`} key="2">
            <Card>
              {/* Usage Progress */}
              {importData.batches && importData.batches.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Tổng quan mức sử dụng</Text>
                    <Text>{usage.toFixed(1)}%</Text>
                  </div>
                  <Progress 
                    percent={usage} 
                    strokeColor={
                      usage === 0 ? '#1890ff' :
                      usage < 50 ? '#52c41a' :
                      usage < 100 ? '#faad14' : '#ff4d4f'
                    }
                  />
                </div>
              )}

              {importData.batches?.length > 0 ? (
                <List
                  dataSource={importData.batches}
                  renderItem={(batch: any, index: number) => {
                    const batchUsage = batch.quantity > 0 ? 
                      ((batch.quantity - batch.remaining_quantity) / batch.quantity) * 100 : 0;
                    const isExpiring = moment(batch.expiry_date).isBefore(moment().add(30, 'days'));
                    const isExpired = moment(batch.expiry_date).isBefore(moment());

                    return (
                      <List.Item key={batch.id}>
                        <List.Item.Meta
                          avatar={
                            <div className="relative">
                              <Avatar 
                                size={80}
                                shape="square"
                                src={batch.ingredient?.image_url}
                                icon={<ShoppingCartOutlined />}
                              />
                              {isExpiring && (
                                <Badge 
                                  status={isExpired ? "error" : "warning"}
                                  className="absolute -top-1 -right-1"
                                />
                              )}
                            </div>
                          }
                          title={
                            <div className="flex justify-between items-start">
                              <div>
                                <Text strong className="text-lg">{batch.ingredient?.name}</Text>
                                <div className="text-sm text-gray-500 mt-1">
                                  <BarcodeOutlined className="mr-1" />
                                  Lô: {batch.name}
                                </div>
                              </div>
                              <div className="text-right">
                                <Tag 
                                  color={batch.status === 'available' ? 'green' : 'default'}
                                  className="mb-1"
                                >
                                  {batch.status === 'available' ? 'Có sẵn' : 'Không có sẵn'}
                                </Tag>
                                {isExpiring && (
                                  <div>
                                    <Tag color={isExpired ? 'red' : 'orange'}>
                                      {isExpired ? 'Đã hết hạn' : 'Sắp hết hạn'}
                                    </Tag>
                                  </div>
                                )}
                              </div>
                            </div>
                          }
                          description={
                            <div className="space-y-3">
                              <Row gutter={16}>
                                <Col span={6}>
                                  <div>
                                    <Text type="secondary" className="text-xs">Số lượng ban đầu:</Text>
                                    <div><Text strong>{batch.quantity} {batch.ingredient?.unit}</Text></div>
                                  </div>
                                </Col>
                                <Col span={6}>
                                  <div>
                                    <Text type="secondary" className="text-xs">Còn lại:</Text>
                                    <div>
                                      <Text strong 
                                        type={batch.remaining_quantity <= 0 ? 'danger' : 'success'}
                                      >
                                        {batch.remaining_quantity} {batch.ingredient?.unit}
                                      </Text>
                                    </div>
                                  </div>
                                </Col>
                                <Col span={6}>
                                  <div>
                                    <Text type="secondary" className="text-xs">Đơn giá:</Text>
                                    <div><Text strong>{batch.price?.toLocaleString('vi-VN')} ₫</Text></div>
                                  </div>
                                </Col>
                                <Col span={6}>
                                  <div>
                                    <Text type="secondary" className="text-xs">Hạn sử dụng:</Text>
                                    <div>
                                      <Text 
                                        strong 
                                        type={isExpired ? 'danger' : isExpiring ? 'warning' : 'success'}
                                      >
                                        {moment(batch.expiry_date).format('DD/MM/YYYY')}
                                      </Text>
                                    </div>
                                  </div>
                                </Col>
                              </Row>

                              {/* Batch Usage Progress */}
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <Text className="text-xs text-gray-500">Mức sử dụng lô này:</Text>
                                  <Text className="text-xs">{batchUsage.toFixed(1)}%</Text>
                                </div>
                                <Progress 
                                  percent={batchUsage} 
                                  size="small"
                                  strokeColor={
                                    batchUsage === 0 ? '#1890ff' :
                                    batchUsage < 50 ? '#52c41a' :
                                    batchUsage < 100 ? '#faad14' : '#ff4d4f'
                                  }
                                  showInfo={false}
                                />
                              </div>
                            </div>
                          }
                        />
                        
                        <div className="ml-4 text-right">
                          <div className="text-lg font-semibold text-green-600">
                            {(batch.quantity * batch.price).toLocaleString('vi-VN')} ₫
                          </div>
                          <div className="text-sm text-gray-500">Thành tiền</div>
                        </div>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty 
                  description="Không có lô hàng nào" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </TabPane>

          <TabPane tab="Lịch sử" key="3">
            <Card>
              <Timeline>
                <Timeline.Item
                  color="blue"
                  dot={<CheckCircleOutlined />}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong>Phiếu nhập được tạo</Text>
                      <div className="text-sm text-gray-500 mt-1">
                        Bởi {importData.created_by?.name}
                      </div>
                    </div>
                    <Text type="secondary" className="text-sm">
                      {moment(importData.created_at).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </div>
                </Timeline.Item>
                
                {importData.batches?.map((batch: any) => (
                  <Timeline.Item
                    key={batch.id}
                    color="green"
                    dot={<ShoppingCartOutlined />}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <Text strong>Lô hàng {batch.ingredient?.name} được thêm</Text>
                        <div className="text-sm text-gray-500 mt-1">
                          {batch.quantity} {batch.ingredient?.unit} - {batch.price?.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                      <Text type="secondary" className="text-sm">
                        {moment(batch.created_at).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ImportDetailPage;
