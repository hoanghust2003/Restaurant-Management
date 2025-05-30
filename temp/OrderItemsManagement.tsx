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

export interface OrderItemsManagementProps {
  items: OrderItemModel[];
  onStatusChange: (itemId: string, status: OrderItemStatus) => Promise<void>;
  isKitchenView?: boolean;
  loading?: boolean;
}

export const OrderItemsManagement: React.FC<OrderItemsManagementProps> = ({ 
  items, 
  onStatusChange,
  isKitchenView = false,
  loading = false
}): React.ReactElement => {
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});

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

  const getStatusIcon = (status: OrderItemStatus): React.ReactElement => {
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
        return <ClockCircleOutlined />;
    }
  };

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
      render: (_: string, record: OrderItemModel) => 
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
    ...(isKitchenView ? [{
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_: string, record: OrderItemModel): React.ReactElement | null => {
        const isItemLoading = loadingItems[record.id];

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
    }] : [{
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_: string, record: OrderItemModel): React.ReactElement | null => {
        if (record.status === OrderItemStatus.DONE || record.status === OrderItemStatus.FAILED) {
          return (
            <Select
              defaultValue={record.status}
              style={{ width: 130 }}
              onChange={(value: OrderItemStatus) => handleStatusChange(record.id, value)}
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
    }]),
  ];

  const groupItems = (itemsToGroup: OrderItemModel[]): OrderItemModel[] => {
    if (!isKitchenView) return itemsToGroup;
    
    const priorityMap: { [key in OrderItemStatus]: number } = {
      [OrderItemStatus.PREPARING]: 0,
      [OrderItemStatus.WAITING]: 1,
      [OrderItemStatus.DONE]: 2,
      [OrderItemStatus.FAILED]: 3,
    };
    
    return [...itemsToGroup].sort((a, b) => 
      priorityMap[a.status] - priorityMap[b.status]
    );
  };

  const renderSummary = (): React.ReactElement => {
    const statusCounts = items.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
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
        dataSource={groupItems(items)} 
        rowKey="id" 
        pagination={false}
        loading={loading}
        size={isKitchenView ? "middle" : "small"}
      />
    </div>
  );
};
