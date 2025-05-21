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
  Space, 
  Divider,
  Popconfirm,
  Modal,
  message
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { supplierService, importService } from '@/app/services/warehouse.service';
import { SupplierModel, ImportModel } from '@/app/models/warehouse.model';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const SupplierDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [supplier, setSupplier] = useState<SupplierModel | null>(null);
  const [imports, setImports] = useState<ImportModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [importsLoading, setImportsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupplier();
  }, [params.id]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getById(params.id);
      setSupplier(data);
      setError(null);
      fetchImports(params.id);
    } catch (err: any) {
      console.error('Error fetching supplier:', err);
      setError(err.message || 'Không thể tải thông tin nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const fetchImports = async (supplierId: string) => {
    try {
      setImportsLoading(true);
      const data = await importService.getAll({ supplier_id: supplierId });
      setImports(data);
    } catch (err: any) {
      console.error('Error fetching imports:', err);
      // Not showing this error to the user as it's not critical
    } finally {
      setImportsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await supplierService.delete(params.id);
      message.success('Đã xóa nhà cung cấp thành công');
      router.push('/warehouse/suppliers');
    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể xóa nhà cung cấp'}`);
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (!supplier) return;
      
      if (supplier.active) {
        await supplierService.deactivate(supplier.id);
        message.success(`Đã hủy kích hoạt nhà cung cấp ${supplier.name}`);
      } else {
        await supplierService.activate(supplier.id);
        message.success(`Đã kích hoạt nhà cung cấp ${supplier.name}`);
      }
      fetchSupplier();
    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể cập nhật trạng thái'}`);
    }
  };

  const confirmDelete = () => {
    if (!supplier) return;
    
    confirm({
      title: `Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.name}"?`,
      content: 'Hành động này không thể hoàn tác',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDelete();
      },
    });
  };

  const importColumns = [
    {
      title: 'Mã phiếu nhập',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: (text: string, record: ImportModel) => (
        <Button 
          type="link" 
          onClick={() => router.push(`/warehouse/imports/${record.id}`)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'import_date',
      key: 'import_date',
      render: (date: Date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a: ImportModel, b: ImportModel) => 
        new Date(a.import_date).getTime() - new Date(b.import_date).getTime(),
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')} VNĐ`,
      sorter: (a: ImportModel, b: ImportModel) => a.total_amount - b.total_amount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = 'Đang xử lý';
        
        if (status === 'completed') {
          color = 'green';
          text = 'Hoàn tất';
        } else if (status === 'cancelled') {
          color = 'red';
          text = 'Đã hủy';
        }
        
        return <Badge color={color} text={text} />;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ImportModel) => (
        <Button 
          type="primary" 
          size="small" 
          onClick={() => router.push(`/warehouse/imports/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin nhà cung cấp..." />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy nhà cung cấp'}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => router.push('/warehouse/suppliers')}>
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
            onClick={() => router.push('/warehouse/suppliers')}
          >
            Quay lại danh sách
          </Button>
          <Space>
            <Button 
              type="primary"
              icon={supplier.active ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={handleToggleStatus}
              danger={supplier.active}
            >
              {supplier.active ? 'Hủy kích hoạt' : 'Kích hoạt'}
            </Button>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => router.push(`/warehouse/suppliers/edit/${supplier.id}`)}
            >
              Chỉnh sửa
            </Button>
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              onClick={confirmDelete}
            >
              Xóa
            </Button>
          </Space>
        </div>

        <div className="mb-6">
          <Title level={3}>
            {supplier.name}
            {!supplier.active && <Badge status="error" text="Không hoạt động" className="ml-4" />}
          </Title>
          <Text type="secondary">Thông tin chi tiết nhà cung cấp</Text>
        </div>
        
        <Descriptions 
          bordered 
          column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Tên nhà cung cấp">{supplier.name}</Descriptions.Item>
          <Descriptions.Item label="Người liên hệ">{supplier.contact_person || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{supplier.phone || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Email">{supplier.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{supplier.address || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Badge 
              status={supplier.active ? 'success' : 'error'} 
              text={supplier.active ? 'Đang hoạt động' : 'Không hoạt động'} 
            />
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo" span={1}>
            {supplier.created_at ? moment(supplier.created_at).format('DD/MM/YYYY HH:mm') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {supplier.notes || 'Không có ghi chú'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Tabs defaultActiveKey="imports">
          <TabPane tab="Lịch sử nhập hàng" key="imports">
            <div className="flex justify-between items-center mb-4">
              <Title level={5}>Các đơn nhập hàng từ nhà cung cấp này</Title>
              <Button 
                type="primary" 
                icon={<ShoppingCartOutlined />} 
                onClick={() => router.push(`/warehouse/imports/create?supplier=${supplier.id}`)}
              >
                Tạo đơn nhập hàng mới
              </Button>
            </div>
            
            <Table 
              columns={importColumns} 
              dataSource={imports} 
              rowKey="id"
              loading={importsLoading}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn nhập hàng`,
              }}
              locale={{ emptyText: 'Chưa có đơn nhập hàng nào từ nhà cung cấp này' }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SupplierDetail;
