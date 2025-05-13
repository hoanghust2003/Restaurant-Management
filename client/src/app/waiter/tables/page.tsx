'use client';

import { useState, useEffect } from 'react';
import WaiterLayout from '@/app/layouts/WaiterLayout';
import { 
  Button, 
  Card, 
  Row, 
  Col, 
  Select, 
  Modal, 
  Form, 
  message, 
  Spin, 
  Empty,
  Tag
} from 'antd';
import axios from '../../utils/axios';
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

export default function WaiterTablesPage() {
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Fetch tables data
    useEffect(() => {
    const fetchTablesData = async () => {
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

    fetchTablesData();
  }, [statusFilter]);
  
  // Handle status modal
  const showStatusModal = (table: TableData) => {
    setSelectedTable(table);
    form.setFieldsValue({
      status: table.status,
    });
    setIsStatusModalVisible(true);
  };
  
  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
  };
    // Handle status update
  const handleStatusUpdate = async (values: Record<string, unknown>) => {
    try {
      if (selectedTable) {
        await axios.patch(`/tables/${selectedTable.id}/status`, {
          status: values.status,
        });
        message.success('Cập nhật trạng thái bàn thành công');
        setIsStatusModalVisible(false);
        
        // Fetch updated table list
        const url = statusFilter 
          ? `/tables?status=${statusFilter}` 
          : '/tables';
        const response = await axios.get(url);
        setTables(response.data);
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      message.error('Không thể cập nhật trạng thái bàn');
    }
  };
  
  // Handle create order for a table
  const handleCreateOrder = (table: TableData) => {
    // Redirect to order creation page with table ID
    window.location.href = `/orders/create?tableId=${table.id}`;
  };
  
  const getStatusColor = (status: string) => {
    return statusColors[status as TableStatus] || 'default';
  };
  
  const getStatusLabel = (status: string) => {
    return statusOptions.find(option => option.value === status)?.label || status;
  };
  
  return (
    <WaiterLayout title="Danh sách bàn">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold">Danh sách bàn</div>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setStatusFilter(value)}
            options={[
              ...statusOptions.map(option => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : tables.length > 0 ? (
          <Row gutter={[16, 16]}>
            {tables.map(table => (
              <Col xs={24} sm={12} md={8} lg={6} key={table.id}>
                <Card
                  title={
                    <div className="flex items-center justify-between">
                      <span>{table.name}</span>
                      <Tag color={getStatusColor(table.status)}>
                        {getStatusLabel(table.status)}
                      </Tag>
                    </div>
                  }
                  className="h-full"
                  actions={[
                    <Button 
                      key="status" 
                      onClick={() => showStatusModal(table)}
                    >
                      Đổi trạng thái
                    </Button>,
                    <Button 
                      key="order" 
                      type="primary"
                      onClick={() => handleCreateOrder(table)}
                      disabled={table.status !== TableStatus.OCCUPIED && table.status !== TableStatus.RESERVED}
                    >
                      Gọi món
                    </Button>,
                  ]}
                >
                  <p><strong>Sức chứa:</strong> {table.capacity} người</p>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Không có bàn nào" />
        )}
      </div>
      
      <Modal
        title="Cập nhật trạng thái bàn"
        open={isStatusModalVisible}
        onCancel={handleStatusCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleStatusCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>
    </WaiterLayout>
  );
}
