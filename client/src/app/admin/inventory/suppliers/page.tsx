'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Space, 
  Button, 
  Input, 
  Popconfirm, 
  message, 
  Switch, 
  Tooltip, 
  Tag,
  Card,
  Typography
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SearchOutlined, 
  UndoOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { SupplierModel } from '@/app/models/supplier.model';
import { supplierService } from '@/app/services/supplier.service';
import { useAuth } from '@/app/contexts/AuthContext';
import AdminLayout from '@/app/layouts/AdminLayout';

const { Title, Text } = Typography;

const SuppliersListComponent: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [showDeleted, setShowDeleted] = useState<boolean>(false);
  const router = useRouter();
  const { hasRole } = useAuth();
  
  // Check admin, manager or warehouse permissions
  const hasPermission = hasRole(['admin', 'manager', 'warehouse']);

  // Fetch suppliers list
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll(showDeleted);
      setSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers list:', error);
      message.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  // Load suppliers when component mounts or showDeleted changes
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers, showDeleted]);

  // Handle search
  const filteredSuppliers = suppliers.filter(
    supplier => 
      supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (supplier.contact_name && supplier.contact_name.toLowerCase().includes(searchText.toLowerCase())) ||
      (supplier.contact_phone && supplier.contact_phone.includes(searchText.toLowerCase())) ||
      (supplier.contact_email && supplier.contact_email.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Handle add new
  const handleAddSupplier = () => {
    router.push('/admin/inventory/suppliers/create');
  };

  // Handle edit
  const handleEditSupplier = (id: string) => {
    router.push(`/admin/inventory/suppliers/edit/${id}`);
  };

  // Handle delete
  const handleDeleteSupplier = async (id: string) => {
    try {
      await supplierService.delete(id);
      message.success('Đã xóa nhà cung cấp thành công');
      fetchSuppliers(); // Refresh list
    } catch (error) {
      console.error('Error deleting supplier:', error);
      message.error('Không thể xóa nhà cung cấp');
    }
  };

  // Handle restore
  const handleRestoreSupplier = async (id: string) => {
    try {
      await supplierService.restore(id);
      message.success('Đã khôi phục nhà cung cấp thành công');
      fetchSuppliers(); // Refresh list
    } catch (error) {
      console.error('Error restoring supplier:', error);
      message.error('Không thể khôi phục nhà cung cấp');
    }
  };

  // Table configuration
  const columns = [
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SupplierModel) => (
        <span className="font-medium">
          {text}
          {record.deleted_at && (
            <Tooltip title="Nhà cung cấp đã xóa">
              <Tag color="red" style={{ marginLeft: 8 }}>
                Đã xóa
              </Tag>
            </Tooltip>
          )}
        </span>
      ),
    },
    {
      title: 'Người liên hệ',
      dataIndex: 'contact_name',
      key: 'contact_name',
      width: 200,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'contact_email',
      key: 'contact_email',
      width: 200,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 200,
      render: (_: any, record: SupplierModel) => (
        <Space size="middle">
          {hasPermission && (
            <>
              {record.deleted_at ? (
                <Popconfirm
                  title="Khôi phục nhà cung cấp"
                  description="Bạn có chắc chắn muốn khôi phục nhà cung cấp này?"
                  onConfirm={() => handleRestoreSupplier(record.id)}
                  okText="Đồng ý"
                  cancelText="Hủy"
                >
                  <Button 
                    type="link" 
                    icon={<UndoOutlined />}
                    className="text-green-600"
                  >
                    Khôi phục
                  </Button>
                </Popconfirm>
              ) : (
                <>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditSupplier(record.id)}
                    className="text-blue-600"
                  >
                    Sửa
                  </Button>
                  <Popconfirm
                    title="Xóa nhà cung cấp"
                    description="Bạn có chắc chắn muốn xóa nhà cung cấp này?"
                    onConfirm={() => handleDeleteSupplier(record.id)}
                    okText="Đồng ý"
                    cancelText="Hủy"
                  >
                    <Button 
                      type="link" 
                      danger 
                      icon={<DeleteOutlined />}
                    >
                      Xóa
                    </Button>
                  </Popconfirm>
                </>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4}>Danh sách nhà cung cấp</Title>
          <Text type="secondary">
            Quản lý thông tin các nhà cung cấp
          </Text>
        </div>
        <div className="flex items-center">
          {hasPermission && (
            <div className="flex items-center mr-4">
              <span className="mr-2">Hiện đã xóa:</span>
              <Switch 
                checked={showDeleted} 
                onChange={(checked) => setShowDeleted(checked)}
              />
            </div>
          )}
          <Input 
            placeholder="Tìm kiếm nhà cung cấp" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            className="mr-2"
          />
          {hasPermission && !showDeleted && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddSupplier}
            >
              Thêm nhà cung cấp
            </Button>
          )}
        </div>
      </div>

      {showDeleted && (
        <div className="bg-yellow-50 p-4 mb-4 rounded-md border border-yellow-200 flex items-center">
          <ExclamationCircleOutlined className="text-yellow-500 mr-2" />
          <span>Đây là danh sách nhà cung cấp đã bị xóa. Bạn có thể khôi phục chúng nếu cần.</span>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={filteredSuppliers}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} nhà cung cấp`,
        }}
        rowClassName={(record) => record.deleted_at ? 'bg-gray-100' : ''}
        expandable={{
          expandedRowRender: (record) => (
            <p style={{ margin: 0 }}>
              <strong>Địa chỉ:</strong> {record.address}
            </p>
          ),
        }}
      />
    </Card>
  );
};

export default function AdminSuppliersPage() {
  return (
    <AdminLayout title="Quản lý nhà cung cấp">
      <div className="p-6">
        <SuppliersListComponent />
      </div>
    </AdminLayout>
  );
}
