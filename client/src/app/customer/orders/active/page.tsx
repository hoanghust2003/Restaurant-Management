'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, message } from 'antd';
import { orderService } from '@/app/services/order.service';
import { formatPrice } from '@/app/utils/format';
import { OrderStatus, orderStatusText } from '@/app/utils/enums';
import { OrderModel } from '@/app/models/order.model';

const { Title } = Typography;

const ACTIVE_STATUSES = [OrderStatus.PENDING, OrderStatus.IN_PROGRESS];

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const allOrders = await orderService.getAll();
      // Lọc lại các đơn đang hoạt động ở client
      const activeOrders = allOrders.filter(order => 
        ACTIVE_STATUSES.includes(order.status as OrderStatus)
      );
      setOrders(activeOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id', 
      render: (id: string) => id.slice(0, 8),
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'name'],
      key: 'tableName',
    },
    {
      title: 'Số món',
      dataIndex: 'items',
      key: 'itemCount',
      render: (items: any[]) => items.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'totalPrice', 
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === OrderStatus.PENDING ? 'gold' : 'green'}>
          {orderStatusText[status]}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <Title level={2}>Đơn hàng đang hoạt động</Title>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>
    </div>
  );
}
