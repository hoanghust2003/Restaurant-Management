'use client';

import React, { useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Popconfirm, 
  message,
  Select,
  Badge
} from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FireOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { OrderItemModel } from '@/app/models/order.model';
import { OrderItemStatus, orderItemStatusText, orderItemStatusColors } from '@/app/utils/enums';
import { formatPrice } from '@/app/utils/format';

const { Title, Text } = Typography;
const { Option } = Select;

interface OrderItemsManagementProps {
  items: OrderItemModel[];
  onStatusChange: (itemId: string, status: OrderItemStatus) => Promise<void>;
  isKitchenView?: boolean;
  loading?: boolean;
}

const OrderItemsManagement: React.FC<OrderItemsManagementProps> = ({ 
  items, 
  onStatusChange,
  isKitchenView = false,
  loading = false
}) => {
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

  // Handle status change for an item
  const handleStatusChange = async (itemId: string, status: OrderItemStatus) => {
    try {
      setLoadingItems(prev => ({ ...prev, [itemId]: true }));
      await onStatusChange(itemId, status);
      message.success(`Trạng thái món đã được cập nhật thành ${orderItemStatusText[status]}`);
    } catch (error) {
      console.error('Failed to update item status:', error);
      message.error('Không thể cập nhật trạng thái món');
    } finally {
      setLoadingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status: OrderItemStatus) => {
    switch (status) {
      case OrderItemStatus.WAITING:
        return <ClockCircleOutlined />;
      case OrderItemStatus.PREPARING:
        return <FireOutlined />;
      case OrderItemStatus.DONE:
        return <CheckCircleOutlined />;
      case OrderItemStatus.FAILED:
        return <ExclamationCircleOutlined />;
      default:
        return null;
    }
  };

  // Columns for the items table
  const columns = [
    {
      title: 'Món',
      dataIndex: ['dish', 'name'],
      key: 'dish',
      render: (text: string, record: OrderItemModel) => (
        <div>
          <Text strong>{text}</Text>
          {record.note && (
            <div>
              <Text type="secondary" italic>Ghi chú: {record.note}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Đơn giá',
      dataIndex: ['dish', 'price'],
      key: 'price',
      width: 150,
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 150,
      render: (_, record: OrderItemModel) => 
        formatPrice((record.dish?.price || 0) * record.quantity),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: OrderItemStatus) => (
        <Tag color={orderItemStatusColors[status]} icon={getStatusIcon(status)}>
          {orderItemStatusText[status]}
        </Tag>
      ),
    },
  ];

  // Add actions column if it's kitchen view
  if (isKitchenView) {
    columns.push({
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record: OrderItemModel) => {
        const isItemLoading = loadingItems[record.id];

        // Different actions based on current status
        if (record.status === OrderItemStatus.WAITING) {
          return (
            <Button 
              type="primary"
              loading={isItemLoading}
              onClick={() => handleStatusChange(record.id, OrderItemStatus.PREPARING)}
              icon={<FireOutlined />}
            >
              Bắt đầu chuẩn bị
            </Button>
          );
        }

        if (record.status === OrderItemStatus.PREPARING) {
          return (
            <Space>
              <Button 
                type="primary"
                loading={isItemLoading}
                onClick={() => handleStatusChange(record.id, OrderItemStatus.DONE)}
                icon={<CheckCircleOutlined />}
              >
                Hoàn thành
              </Button>
              <Popconfirm
                title="Báo không thể thực hiện"
                description="Bạn có chắc chắn món này không thể thực hiện được không?"
                onConfirm={() => handleStatusChange(record.id, OrderItemStatus.FAILED)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button 
                  danger 
                  loading={isItemLoading}
                  icon={<ExclamationCircleOutlined />}
                >
                  Không thể thực hiện
                </Button>
              </Popconfirm>
            </Space>
          );
        }

        return null;
      },
    });
  } else {
    // For waiter view, add a simpler actions column
    columns.push({
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record: OrderItemModel) => {
        // Only show actions for items that need attention
        if (record.status === OrderItemStatus.DONE || record.status === OrderItemStatus.FAILED) {
          return (
            <Select
              defaultValue={record.status}
              style={{ width: 130 }}
              onChange={(value) => handleStatusChange(record.id, value)}
              loading={loadingItems[record.id]}
            >
              <Option value={OrderItemStatus.WAITING}>Chờ xử lý</Option>
              <Option value={OrderItemStatus.PREPARING}>Đang chuẩn bị</Option>
              <Option value={OrderItemStatus.DONE}>Hoàn thành</Option>
              <Option value={OrderItemStatus.FAILED}>Không thể thực hiện</Option>
            </Select>
          );
        }
        return null;
      },
    });
  }

  // Group items by status for kitchen view
  const getGroupedItems = () => {
    if (!isKitchenView) return items;
    
    // Sort by priority: PREPARING, WAITING, DONE, FAILED
    return [...items].sort((a, b) => {
      const priorityMap: Record<OrderItemStatus, number> = {
        [OrderItemStatus.PREPARING]: 0,
        [OrderItemStatus.WAITING]: 1,
        [OrderItemStatus.DONE]: 2,
        [OrderItemStatus.FAILED]: 3,
      };
      
      return priorityMap[a.status] - priorityMap[b.status];
    });
  };

  // Summary section showing counts by status
  const renderSummary = () => {
    const statusCounts = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return (
      <div className="mb-4 flex gap-4">
        {Object.values(OrderItemStatus).map(status => (
          <Badge 
            key={status} 
            count={statusCounts[status] || 0} 
            showZero
            style={{ backgroundColor: orderItemStatusColors[status] }}
          >
            <Tag color={orderItemStatusColors[status]} className="px-3 py-1">
              {orderItemStatusText[status]}
            </Tag>
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div>
      {renderSummary()}
      
      <Table 
        columns={columns} 
        dataSource={getGroupedItems()} 
        rowKey="id" 
        pagination={false}
        loading={loading}
        size={isKitchenView ? "middle" : "small"}
      />
    </div>
  );
};

export default OrderItemsManagement;
