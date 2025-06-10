'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Card, Typography, message } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useSocket } from '@/app/contexts/SocketContext';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { formatPrice } from '@/app/utils/format';
import { OrderStatus, OrderItemStatus } from '@/app/utils/enums';

const { Title, Text } = Typography;

interface KitchenOrderListProps {
  onSelectOrder: (order: OrderModel) => void;
}

const KitchenOrderList: React.FC<KitchenOrderListProps> = ({ onSelectOrder }) => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      // Join kitchen room
      socket.emit('kitchen:join');

      // Listen for new orders
      socket.on('order:new', (newOrder: OrderModel) => {
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        message.info(`Có đơn hàng mới: #${newOrder.code}`);
      });

      // Listen for order status updates
      socket.on('order:status_update', (data: { orderId: string; status: OrderStatus }) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
      });

      // Listen for order item status updates
      socket.on('order:item_status_update', 
        (data: { orderId: string; itemId: string; status: OrderItemStatus }) => {
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.id === data.orderId
                ? {
                    ...order,
                    items: order.items?.map(item =>
                      item.id === data.itemId
                        ? { ...item, status: data.status }
                        : item
                    )
                  }
                : order
            )
          );
        }
      );

      return () => {
        socket.off('order:new');
        socket.off('order:status_update');
        socket.off('order:item_status_update');
      };
    }
  }, [socket]);

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'gold';
      case OrderStatus.IN_PROGRESS:
        return 'processing';
      case OrderStatus.READY:
        return 'success';
      case OrderStatus.COMPLETED:
        return 'green';
      case OrderStatus.CANCELED:
        return 'red';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'name'],
      key: 'table',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={getOrderStatusColor(status)}>
          {status === OrderStatus.PENDING && 'Chờ xử lý'}
          {status === OrderStatus.IN_PROGRESS && 'Đang chuẩn bị'}
          {status === OrderStatus.READY && 'Sẵn sàng'}
          {status === OrderStatus.COMPLETED && 'Hoàn thành'}
          {status === OrderStatus.CANCELED && 'Đã hủy'}
        </Tag>
      ),
    },
    {
      title: 'Số món',
      key: 'itemCount',
      render: (_: unknown, record: OrderModel) => record.items?.length || 0,
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: unknown, record: OrderModel) => {
        const time = new Date(record.created_at);
        return time.toLocaleTimeString('vi-VN');
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: OrderModel) => (
        <Button 
          type="primary"
          onClick={() => onSelectOrder(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Title level={4}>Danh sách đơn hàng</Title>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ defaultPageSize: 10 }}
      />
    </Card>
  );
};

export default KitchenOrderList;
