'use client';

import { useState, useEffect } from 'react';
import RoleBasedLayout from '@/app/components/RoleBasedLayout';
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
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '@/app/utils/axios';
import { TableStatus } from '@/app/utils/enums';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: string;
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
    // Load tables data on component mount and when filter changes
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const url = statusFilter 
          ? `/tables?status=${statusFilter}` 
          : '/tables';
        const response = await axios.get(url);
        setTables(response.data);
      } catch (error) {
        console.error('Error fetching tables:', error);
        message.error('Không thể tải danh sách bàn');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [statusFilter]);
  
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
      if (isEditing && currentTable) {
        // Update existing table
        await axios.put(`/tables/${currentTable.id}`, values);
        message.success('Cập nhật bàn thành công');
      } else {
        // Create new table
        await axios.post('/tables', values);
        message.success('Tạo bàn mới thành công');
      }
      setIsModalVisible(false);
      
      // Fetch updated table list
      const url = statusFilter 
        ? `/tables?status=${statusFilter}` 
        : '/tables';
      const response = await axios.get(url);
      setTables(response.data);
    } catch (error) {
      console.error('Error saving table:', error);
      message.error('Không thể lưu thông tin bàn');
    }
  };
    // Handle table deletion
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/tables/${id}`);
      message.success('Xóa bàn thành công');
      
      // Fetch updated table list
      const url = statusFilter 
        ? `/tables?status=${statusFilter}` 
        : '/tables';
      const response = await axios.get(url);
      setTables(response.data);
    } catch (error) {
      console.error('Error deleting table:', error);
      message.error('Không thể xóa bàn');
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
      key: 'action',
      render: (_: unknown, record: TableData) => (
        <div className="flex space-x-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa bàn"
            description="Bạn có chắc chắn muốn xóa bàn này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
    return (
    <RoleBasedLayout title="Quản lý bàn" allowedRoles={['admin', 'waiter']}>
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
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm bàn mới
            </Button>
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
          
          {isEditing && (
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select options={statusOptions} />
            </Form.Item>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              {isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>          </div>
        </Form>
      </Modal>
    </RoleBasedLayout>
  );
}
