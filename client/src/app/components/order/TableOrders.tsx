'use client';

import React, { useState, useEffect } from 'react';
import {
  Button,
  Popover,
  Badge,
  Card,
  Typography,
  Space,
  Tag,
  Spin,
  Empty
} from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { orderService } from '@/app/services/order.service';
import { TableModel } from '@/app/models/table.model';
import { OrderModel } from '@/app/models/order.model';
import { formatPrice, formatDateTime } from '@/app/utils/format';
import { TableStatus, OrderStatus, tableStatusColors, orderStatusColors, orderStatusText } from '@/app/utils/enums';

const { Title, Text } = Typography;

interface TableOrdersProps {
  table: TableModel;
  onCreateOrder?: () => void;
}

const TableOrders: React.FC<TableOrdersProps> = ({ table, onCreateOrder }) => {
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // Fetch active order for the table when the component mounts
  useEffect(() => {
    fetchActiveOrder();
  }, [table.id]);

  const fetchActiveOrder = async () => {
    try {
      setLoading(true);
      const activeOrder = await orderService.getActiveByTable(table.id);
      setOrder(activeOrder);
    } catch (error) {
      console.error('Error fetching active order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new order for this table
  const handleCreateOrder = () => {
    router.push(`/orders/new?tableId=${table.id}`);
    if (onCreateOrder) onCreateOrder();
  };

  // Handle viewing order details
  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  // The content to show in the popover
  const popoverContent = (
    <div style={{ maxWidth: 300 }}>
      {loading ? (
        <div className="text-center py-2">
          <Spin size="small" />
        </div>
      ) : order ? (
        <Card size="small" bodyStyle={{ padding: '12px' }}>
          <div className="mb-2 flex justify-between items-center">
            <Text strong>Đơn #{order.code || order.id.substring(0, 8)}</Text>
            <Tag color={orderStatusColors[order.status]}>
              {orderStatusText[order.status]}
            </Tag>
          </div>
          
          <div className="mb-2">
            <Text type="secondary">Thời gian: {formatDateTime(order.created_at)}</Text>
          </div>
          
          {order.items && (
            <div className="mb-2">
              <Text>Số món: {order.items.length}</Text>
              <ul className="pl-5 mt-1">
                {order.items.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    {item.dish?.name} x{item.quantity}
                  </li>
                ))}
                {order.items.length > 3 && (
                  <li>...và {order.items.length - 3} món khác</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="mb-2">
            <Text strong>Tổng tiền: {formatPrice(order.total_price)}</Text>
          </div>
          
          <Button 
            type="primary" 
            size="small" 
            block
            icon={<EyeOutlined />}
            onClick={() => handleViewOrder(order.id)}
          >
            Xem chi tiết
          </Button>
        </Card>
      ) : (
        <div>
          <Empty 
            description="Không có đơn hàng" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          <Button 
            type="primary" 
            size="small" 
            icon={<PlusOutlined />} 
            onClick={handleCreateOrder}
            block
          >
            Tạo đơn hàng
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {table.status === TableStatus.IN_USE ? (
        <Popover 
          content={popoverContent} 
          title={`Đơn hàng - ${table.name}`}
          trigger="click"
          placement="right"
        >
          <Badge 
            count={order ? 1 : 0} 
            offset={[-5, 5]}
            size="small"
          >
            <Button type="link">Xem đơn</Button>
          </Badge>
        </Popover>
      ) : (
        <Button 
          type="primary" 
          size="small"
          icon={<PlusOutlined />}
          onClick={handleCreateOrder}
          disabled={table.status !== TableStatus.AVAILABLE}
        >
          Tạo đơn
        </Button>
      )}
    </div>
  );
};

export default TableOrders;
