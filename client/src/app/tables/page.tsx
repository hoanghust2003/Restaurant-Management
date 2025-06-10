'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import LayoutProvider from '@/app/layouts/LayoutProvider';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  Table, 
  Modal, 
  Form,
  Input, 
  InputNumber,
  Select,
  message,
  Tag,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons';
import axios from '@/app/utils/axios';
import { TableStatus } from '@/app/utils/enums';
import QrCodeModal from '@/app/components/QrCodeModal';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
}

interface TableFormData {
  name: string;
  capacity: number;
  status: TableStatus;
}

const statusOptions = [
  { value: TableStatus.AVAILABLE, label: 'Trống' },
  { value: TableStatus.OCCUPIED, label: 'Đang sử dụng' },
  { value: TableStatus.RESERVED, label: 'Đã đặt trước' },
  { value: TableStatus.CLEANING, label: 'Đang dọn dẹp' },
];

const statusColors = {
  [TableStatus.AVAILABLE]: 'success',
  [TableStatus.OCCUPIED]: 'error',
  [TableStatus.RESERVED]: 'warning',
  [TableStatus.CLEANING]: 'processing',
};

export default function TablesPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTable, setCurrentTable] = useState<TableData | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [qrCodeModalVisible, setQrCodeModalVisible] = useState<boolean>(false);
  const [selectedQrTable, setSelectedQrTable] = useState<TableData | null>(null);
  const { user, hasRole, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Check user permissions
  useEffect(() => {
    if (!authLoading && user && !hasRole(['admin', 'staff'])) {
      router.push('/');
      message.error('Bạn không có quyền truy cập trang này');
    }
  }, [user, authLoading, hasRole, router]);

  // Load tables data on component mount and when filter changes
  useEffect(() => {
    if (user) {
      const fetchTables = async () => {
        setLoading(true);
        try {
          const url = statusFilter 
            ? `/tables?status=${statusFilter}` 
            : '/tables';
          const response = await axios.get(url);
          // Convert API response to match TableData interface
          const formattedTables = response.data.map((table: any) => ({
            ...table,
            status: table.status as TableStatus
          }));
          setTables(formattedTables);
        } catch (error: any) {
          console.error('Error fetching tables:', error);
          
          if (error.response?.status === 403) {
            message.error('Bạn không có quyền xem danh sách bàn');
          } else if (!error.response) {
            message.error('Mất kết nối tới máy chủ. Vui lòng kiểm tra mạng.');
          } else {
            message.error('Không thể tải danh sách bàn');
          }
        } finally {
          setLoading(false);
        }
      };
  
      fetchTables();
    }
  }, [statusFilter, user]);
  
  // Handle modal visibility
  const showModal = (table?: TableData) => {
    if (table) {
      // Editing existing table
      setCurrentTable(table);
      setIsEditing(true);
      form.setFieldsValue({
        name: table.name,
        capacity: table.capacity,
        status: table.status,
      });
    } else {
      // Creating new table
      setCurrentTable(null);
      setIsEditing(false);
      form.resetFields();
      form.setFieldsValue({
        status: TableStatus.AVAILABLE,
      });
    }
    setIsModalVisible(true);
  };
  
  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle form submission
  const handleSubmit = async (values: TableFormData) => {
    try {
      setLoading(true);
      
      if (isEditing && currentTable) {
        // Update existing table
        await axios.put(`/tables/${currentTable.id}`, values);
        message.success('Cập nhật bàn thành công');
      } else {
        // Create new table
        await axios.post('/tables', values);
        message.success('Tạo bàn mới thành công');
      }

      // Close modal and reset form
      setIsModalVisible(false);
      form.resetFields();
      
      // Refresh table list
      const url = statusFilter ? `/tables?status=${statusFilter}` : '/tables';
      const response = await axios.get(url);
      const updatedTables: TableData[] = response.data.map((table: any) => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        status: table.status as TableStatus
      }));
      setTables(updatedTables);
    } catch (error: any) {
      let errorMessage = 'Không thể lưu thông tin bàn';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle table deletion
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await axios.delete(`/tables/${id}`);
      message.success('Xóa bàn thành công');
      
      // Refresh table list
      const url = statusFilter 
        ? `/tables?status=${statusFilter}` 
        : '/tables';
      const response = await axios.get(url);
      const updatedTables: TableData[] = response.data.map((table: any) => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        status: table.status as TableStatus
      }));
      setTables(updatedTables);
    } catch (error: any) {
      console.error('Error deleting table:', error);
      message.error(error.response?.data?.message || 'Không thể xóa bàn');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle status change
  const handleStatusFilterChange = (value: string | null) => {
    setStatusFilter(value);
  };

  const columns = [
    {
      title: 'Tên bàn',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (capacity: number) => `${capacity} người`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: TableStatus) => {
        const statusLabel = statusOptions.find(option => option.value === status)?.label || status;
        return <Tag color={statusColors[status]}>{statusLabel}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: TableData) => (
        <div className="flex space-x-2">
          {hasRole(['admin']) ? (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => showModal(record)}
                size="small"
                type="link"
                className="edit-button"
              >
                Sửa
              </Button>
              <Button
                icon={<QrcodeOutlined />}
                onClick={() => handleShowQrCode(record)}
                size="small"
                type="link"
                className="qr-button"
              >
                Mã QR
              </Button>
              <Popconfirm
                title="Xóa bàn"
                description="Bạn có chắc chắn muốn xóa bàn này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Có"
                cancelText="Không"
                placement="topRight"
                okButtonProps={{ danger: true }}
              >
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                  type="link"
                >
                  Xóa
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              <Button
                icon={<EditOutlined />}
                onClick={() => showModal(record)}
                size="small"
                type="link"
              >
                Cập nhật trạng thái
              </Button>
              <Button
                icon={<QrcodeOutlined />}
                onClick={() => handleShowQrCode(record)}
                size="small"
                type="link"
              >
                Mã QR
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Handle showing QR code
  const handleShowQrCode = (table: TableData) => {
    setSelectedQrTable(table);
    setQrCodeModalVisible(true);
  };

  // Handle hiding QR code
  const handleCloseQrCode = () => {
    setQrCodeModalVisible(false);
    setTimeout(() => {
      setSelectedQrTable(null);
    }, 200);
  };
  
  return (
    <AuthGuard allowedRoles={['admin', 'staff']}>
      <LayoutProvider title="Quản lý bàn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl font-bold">Danh sách bàn</div>
            <div className="flex space-x-4">
              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: 200 }}
                allowClear
                onChange={handleStatusFilterChange}
                options={statusOptions.map(option => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
              {hasRole(['admin']) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  Thêm bàn mới
                </Button>
              )}
            </div>
          </div>
          
          <Table
            columns={columns}
            dataSource={tables}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
            }}
          />
        </div>
        
        <Modal
          title={isEditing ? "Sửa thông tin bàn" : "Thêm bàn mới"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {hasRole(['admin']) ? (
              <>
                <Form.Item
                  name="name"
                  label="Tên bàn"
                  rules={[{ required: true, message: 'Vui lòng nhập tên bàn' }]}
                >
                  <Input placeholder="Nhập tên bàn" />
                </Form.Item>
                
                <Form.Item
                  name="capacity"
                  label="Sức chứa"
                  rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
                >
                  <InputNumber
                    min={1}
                    max={50}
                    placeholder="Nhập sức chứa"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </>
            ) : null}
            
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select 
                options={statusOptions}
                placeholder="Chọn trạng thái"
              />
            </Form.Item>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEditing ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </Form>
        </Modal>
        
        <QrCodeModal
          open={qrCodeModalVisible}
          table={selectedQrTable}
          onClose={handleCloseQrCode}
        />
      </LayoutProvider>
    </AuthGuard>
  );
}
