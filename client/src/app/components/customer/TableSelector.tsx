'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Input,
  Typography,
  Alert,
  Space,
  Spin,
  Empty,
  message
} from 'antd';
import {
  TableOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { customerService } from '@/app/services/customer.service';
import { TableModel } from '@/app/models/table.model';
import { TableStatus } from '@/app/utils/enums';

const { Title, Text } = Typography;

interface TableSelectorProps {
  visible: boolean;
  onClose: () => void;
  onTableSelect: (table: TableModel) => void;
  currentTableId?: string;
  title?: string;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  visible,
  onClose,
  onTableSelect,
  currentTableId,
  title = "Chọn bàn của bạn"
}) => {
  const [tables, setTables] = useState<TableModel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');

  // Load available tables when modal opens
  useEffect(() => {
    if (visible) {
      loadTables();
    }
  }, [visible]);

  const loadTables = async () => {
    try {
      setLoading(true);
      const tableData = await customerService.getAvailableTables();
      setTables(tableData);
    } catch (error) {
      console.error('Error loading tables:', error);
      message.error('Không thể tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  // Filter tables based on search text and show only available tables
  const filteredTables = tables.filter(table => {
    const matchesSearch = searchText ? table.name.toLowerCase().includes(searchText.toLowerCase()) : true;
    // Only show truly available tables for customers
    const isAvailable = table.status === TableStatus.AVAILABLE;
    return matchesSearch && isAvailable;
  });

  const handleTableClick = (table: TableModel) => {
    if (table.id === currentTableId) {
      message.info('Bạn đang chọn bàn này rồi');
      return;
    }
    
    // Double check table availability before selection
    if (table.status !== TableStatus.AVAILABLE) {
      message.error('Bàn này hiện không khả dụng');
      loadTables(); // Refresh the list
      return;
    }
    
    onTableSelect(table);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return 'success';
      case TableStatus.RESERVED:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return 'Trống';
      case TableStatus.RESERVED:
        return 'Đã đặt trước';
      default:
        return status;
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center">
          <TableOutlined className="mr-2" />
          <span>{title}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      centered
      width={700}
    >
      <Alert 
        message="Chọn bàn để đặt món" 
        description="Vui lòng chọn bàn trước khi đặt món. Hệ thống chỉ hiển thị các bàn còn trống hoặc đã đặt trước." 
        type="info" 
        showIcon 
        className="mb-4"
      />

        <div className="mb-4 flex justify-between items-center">
          <Input
            placeholder="Tìm kiếm bàn..."
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '60%' }}
            allowClear
          />
          <div className="flex items-center space-x-2">
            <Text type="secondary">
              {filteredTables.length} bàn trống
            </Text>
            <Button 
              type="link" 
              onClick={loadTables} 
              loading={loading}
              size="small"
            >
              Làm mới
            </Button>
          </div>
        </div>

      {loading ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-2 text-gray-500">Đang tải danh sách bàn...</div>
        </div>
      ) : filteredTables.length === 0 ? (
        <Empty 
          description={searchText ? "Không tìm thấy bàn nào" : "Không có bàn trống"} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {filteredTables.map(table => (
            <Card 
              key={table.id}
              hoverable
              size="small"
              className={`cursor-pointer transition-all hover:shadow-md ${
                table.id === currentTableId ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleTableClick(table)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">{table.name}</div>
                  <div className="text-gray-500">
                    <UsergroupAddOutlined className="mr-1" />
                    Sức chứa: {table.capacity} người
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Tag 
                    color={getStatusColor(table.status)} 
                    icon={table.status === TableStatus.AVAILABLE ? <CheckCircleOutlined /> : undefined}
                  >
                    {getStatusText(table.status)}
                  </Tag>
                  {table.id === currentTableId && (
                    <Text type="secondary" className="text-xs mt-1">
                      Đang chọn
                    </Text>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <Button onClick={onClose}>
          Đóng
        </Button>
        {filteredTables.length === 0 && !loading && (
          <Button 
            type="primary" 
            onClick={loadTables} 
            loading={loading}
          >
            Tải lại danh sách
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default TableSelector;
