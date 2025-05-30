'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Table, 
  Space, 
  Button, 
  Tag, 
  Spin, 
  Alert, 
  Badge, 
  Divider, 
  Modal 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PrinterOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined 
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import moment from 'moment';
import { importService } from '@/app/services/warehouse.service';
import { ImportModel, ImportItemModel } from '@/app/models/warehouse.model';

const { Title, Text } = Typography;

const ImportDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [importData, setImportData] = useState<ImportModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);

  useEffect(() => {
    if (params.id) {
      fetchImport();
    }
  }, [params.id]);

  const fetchImport = async () => {
    try {
      setLoading(true);
      const data = await importService.getById(params.id);
      setImportData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching import details:', err);
      setError(err.message || 'Không thể tải thông tin phiếu nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      setStatusUpdateLoading(true);
      await importService.updateStatus(params.id, status);
      message.success('Cập nhật trạng thái thành công');
      fetchImport();
    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể cập nhật trạng thái'}`);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleStatusUpdate = (status: string) => {
    Modal.confirm({
      title: 'Xác nhận cập nhật trạng thái',
      content: `Bạn có chắc chắn muốn ${status === 'completed' ? 'hoàn thành' : 'hủy'} phiếu nhập này?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => handleUpdateStatus(status),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      title: 'Nguyên liệu',
      dataIndex: 'ingredient',
      key: 'ingredient',
      render: (ingredient: any) => ingredient?.name || 'N/A',
    },
    {
      title: 'Đơn vị',
      dataIndex: 'ingredient',
      key: 'unit',
      render: (ingredient: any) => ingredient?.unit || 'N/A',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: number) => price.toLocaleString('vi-VN') + ' VND',
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_, record: ImportItemModel) => {
        const total = record.quantity * record.unit_price;
        return total.toLocaleString('vi-VN') + ' VND';
      },
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: Date | undefined) => date ? moment(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Mã lô',
      dataIndex: 'lot_number',
      key: 'lot_number',
      render: (text: string | undefined) => text || 'N/A',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin phiếu nhập kho..." />
      </div>
    );
  }

  if (error || !importData) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy thông tin phiếu nhập kho'}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/warehouse/imports')}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'blue', text: 'Đang xử lý' };
      case 'completed':
        return { color: 'green', text: 'Hoàn thành' };
      case 'cancelled':
        return { color: 'red', text: 'Đã hủy' };
      default:
        return { color: 'default', text: 'Không xác định' };
    }
  };

  const statusInfo = getStatusInfo(importData.status);

  return (
    <div className="p-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/warehouse/imports')}
              className="mr-4"
            >
              Quay lại
            </Button>
            <div>
              <Title level={4}>Chi tiết phiếu nhập kho</Title>
              <Text type="secondary">Mã phiếu: {importData.reference_number}</Text>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Space>
              <Button 
                icon={<PrinterOutlined />} 
                onClick={handlePrint}
              >
                In phiếu
              </Button>
              
              {importData.status === 'pending' && (
                <>
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />}
                    loading={statusUpdateLoading}
                    onClick={() => handleStatusUpdate('completed')}
                  >
                    Hoàn thành
                  </Button>
                  <Button 
                    danger 
                    icon={<CloseCircleOutlined />}
                    loading={statusUpdateLoading}
                    onClick={() => handleStatusUpdate('cancelled')}
                  >
                    Hủy phiếu
                  </Button>
                </>
              )}
            </Space>
          </div>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
        >
          <Descriptions.Item label="Mã phiếu" span={2}>
            {importData.reference_number}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái" span={2}>
            <Badge status={statusInfo.color as any} text={statusInfo.text} />
          </Descriptions.Item>
          
          <Descriptions.Item label="Nhà cung cấp" span={2}>
            {importData.supplier?.name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập kho" span={2}>
            {moment(importData.import_date).format('DD/MM/YYYY')}
          </Descriptions.Item>
          
          <Descriptions.Item label="Tổng tiền" span={2}>
            <Text strong>{importData.total_amount.toLocaleString('vi-VN')} VND</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo" span={2}>
            {importData.created_by || 'N/A'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Ngày tạo" span={2}>
            {moment(importData.created_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {importData.notes || 'Không có ghi chú'}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Chi tiết nguyên liệu</Divider>

        <Table 
          columns={columns} 
          dataSource={importData.items} 
          rowKey="id"
          pagination={false}
          summary={() => {
            const total = importData.items.reduce(
              (sum, item) => sum + (item.quantity * item.unit_price),
              0
            );
            
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <strong>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={3}>
                  <strong>{total.toLocaleString('vi-VN')} VND</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default ImportDetailPage;
