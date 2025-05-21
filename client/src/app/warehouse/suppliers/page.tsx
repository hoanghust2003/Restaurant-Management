'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Card, 
  Typography, 
  Tooltip, 
  Spin, 
  Alert, 
  Popconfirm,
  Modal,
  Badge,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supplierService } from '@/app/services/warehouse.service';
import { SupplierModel } from '@/app/models/warehouse.model';
import WarehouseLayout from '@/app/layouts/WarehouseLayout';

const { Title, Text } = Typography;
const { confirm } = Modal;

const SuppliersList: React.FC = () => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showInactive, setShowInactive] = useState<boolean>(false);

  useEffect(() => {
    fetchSuppliers();
  }, [showInactive]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll(showInactive);
      setSuppliers(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError(err.message || 'Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleToggleShowInactive = () => {
    setShowInactive(!showInactive);
  };

  const handleDelete = async (id: string) => {
    try {
      await supplierService.delete(id);
      message.success('Đã xóa nhà cung cấp thành công');
      fetchSuppliers();
    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể xóa nhà cung cấp'}`);
    }
  };

  const handleToggleStatus = async (supplier: SupplierModel) => {
    try {
      if (supplier.active) {
        await supplierService.deactivate(supplier.id);
        message.success(`Đã hủy kích hoạt nhà cung cấp ${supplier.name}`);
      } else {
        await supplierService.activate(supplier.id);
        message.success(`Đã kích hoạt nhà cung cấp ${supplier.name}`);
      }
      fetchSuppliers();
    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể cập nhật trạng thái'}`);
    }
  };

  const confirmDelete = (supplier: SupplierModel) => {
    confirm({
      title: `Bạn có chắc chắn muốn xóa nhà cung cấp "${supplier.name}"?`,
      content: 'Hành động này không thể hoàn tác',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleDelete(supplier.id);
      },
    });
  };

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (supplier.contact_person || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (supplier.phone || '').includes(searchText) ||
    (supplier.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (supplier.address || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: SupplierModel, b: SupplierModel) => a.name.localeCompare(b.name),
      render: (text: string, record: SupplierModel) => (
        <Link href={`/warehouse/suppliers/${record.id}`}>
          <span className="font-medium text-blue-600 hover:text-blue-800">
            {text}
            {!record.active && <Tag color="red" className="ml-2">Không hoạt động</Tag>}
          </span>
        </Link>
      ),
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_person',
      key: 'contact_person',
      render: (text: string | undefined) => text || 'N/A',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string | undefined) => text || 'N/A',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string | undefined) => text || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? 'Đang hoạt động' : 'Không hoạt động'} 
        />
      ),
      filters: [
        { text: 'Đang hoạt động', value: true },
        { text: 'Không hoạt động', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: SupplierModel) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => router.push(`/warehouse/suppliers/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => router.push(`/warehouse/suppliers/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title={record.active ? 'Hủy kích hoạt' : 'Kích hoạt'}>
            <Button 
              icon={record.active ? <StopOutlined /> : <CheckCircleOutlined />}
              size="small"
              danger={record.active}
              type={record.active ? 'default' : 'primary'}
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger
              onClick={() => confirmDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách nhà cung cấp..." />
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
            <Title level={4}>Quản lý nhà cung cấp</Title>
            <Text type="secondary">Danh sách các nhà cung cấp</Text>
          </div>
          <div className="mt-2 sm:mt-0">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => router.push('/warehouse/suppliers/create')}
            >
              Thêm nhà cung cấp mới
            </Button>
          </div>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-4">
          <div className="w-full md:w-1/3">
            <Input 
              placeholder="Tìm kiếm theo tên, liên hệ, điện thoại, email" 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={handleSearch}
              allowClear
            />
          </div>
          
          <div>
            <Button 
              onClick={handleToggleShowInactive}
              type={showInactive ? 'primary' : 'default'}
            >
              {showInactive ? 'Ẩn' : 'Hiện'} nhà cung cấp không hoạt động
            </Button>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredSuppliers} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nhà cung cấp`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default function SuppliersPage() {
  return (
    <WarehouseLayout title="Nhà cung cấp">
      <SuppliersList />
    </WarehouseLayout>
  );
}
