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
  const [loading, setLoading] = useState(false);  const [statusFilter, setStatusFilter] = useState<string | null>(null);
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
          
          // More detailed error handling
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
      setCurrentTable(table);
      setIsEditing(true);
      form.setFieldsValue({
        name: table.name,
        capacity: table.capacity,
        status: table.status,
      });
    } else {
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
  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      console.log('Submitting form with values:', values);
      
      if (isEditing && currentTable) {
        // Update existing table
        const response = await axios.put(`/tables/${currentTable.id}`, values);
        console.log('Update response:', response.data);
        message.success('Cập nhật bàn thành công');
      } else {
        // Create new table
        const response = await axios.post('/tables', values);
        console.log('Create response:', response.data);
        message.success('Tạo bàn mới thành công');
      }
      setIsModalVisible(false);
      
      // Fetch updated table list
      const url = statusFilter 
        ? `/tables?status=${statusFilter}` 
        : '/tables';
      const response = await axios.get(url);
      setTables(response.data);
    } catch (error: any) {
      console.error('Error saving table:', error);
      message.error(error.response?.data?.message || 'Không thể lưu thông tin bàn');
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
      setTables(response.data.map((table: any) => ({
        ...table,
        status: table.status as TableStatus
      })));
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
    // Define column type using Ant Design's ColumnType
  interface TableColumnType {
    title: string;
    dataIndex?: string;
    key: string;
    render?: (value: unknown, record: TableData, index: number) => React.ReactNode;
  }

  const columns: TableColumnType[] = [
    {
      title: 'Tên bàn',
      dataIndex: 'name',
      key: 'name',
    },    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (value: unknown) => {
        const capacity = value as number;
        return `${capacity} người`;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (value: unknown) => {
        const status = value as string;
        const statusLabel = statusOptions.find(option => option.value === status)?.label || status;
        return <Tag color={statusColors[status as TableStatus] || 'default'}>{statusLabel}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',      render: (_: unknown, record: TableData) => (
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

  // Handle hiding QR code with cleanup
  const handleCloseQrCode = () => {
    setQrCodeModalVisible(false);
    // Use a short timeout to allow modal close animation to complete
    setTimeout(() => {
      setSelectedQrTable(null);
    }, 200);
  };

  // Handle status change with optimistic updates and proper error handling
  const handleStatusChange = async (id: string, newStatus: string) => {
    const tableToUpdate = tables.find(t => t.id === id);
    if (!tableToUpdate) {
      message.error('Không tìm thấy bàn cần cập nhật');
      return;
    }

    const originalStatus = tableToUpdate.status;

    try {
      // Start loading state
      setLoading(true);
      
      // Optimistic update
      setTables(prevTables =>
        prevTables.map(t =>
          t.id === id ? { ...t, status: newStatus } : t
        )
      );
      
      // Make the API call
      await axios.patch(`/tables/${id}/status`, { status: newStatus });
      message.success('Cập nhật trạng thái bàn thành công');
      
      // Refresh the table list in the background
      const url = statusFilter 
        ? `/tables?status=${statusFilter}` 
        : '/tables';
      const response = await axios.get(url);
      setTables(response.data.map((table: any) => ({
        ...table,
        status: table.status as TableStatus
      })));

    } catch (error: any) {
      // Revert optimistic update on error
      setTables(prevTables =>
        prevTables.map(t =>
          t.id === id ? { ...t, status: originalStatus } : t
        )
      );
      
      // Show appropriate error message
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền thay đổi trạng thái bàn');
      } else if (!error.response) {
        message.error('Mất kết nối tới máy chủ. Vui lòng kiểm tra mạng.');
      } else {
        message.error(error.response?.data?.message || 'Không thể cập nhật trạng thái bàn');
      }
      console.error('Error updating table status:', error);
    } finally {
      setLoading(false);
    }
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
              options={[
                ...statusOptions.map(option => ({
                  value: option.value,
                  label: option.label,
                })),
              ]}            />
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
        >          {hasRole(['admin']) ? (
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
              options={statusOptions.map(status => ({
                value: status.value,
                label: status.label
              }))}
              placeholder="Chọn trạng thái"
            />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>          </div>
        </Form>
      </Modal>
      
      {/* QR Code Modal */}        <QrCodeModal
          open={qrCodeModalVisible}
          table={selectedQrTable}
          onClose={handleCloseQrCode}
          destroyOnHidden
        />
      </LayoutProvider>
    </AuthGuard>
  );
}
