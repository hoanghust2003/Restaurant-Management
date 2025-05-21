'use client';

import React from 'react';
import { Table, Space, Button, Tag } from 'antd';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { OrderModel } from '@/app/models/order.model';
import { formatPrice, formatDateTime } from '@/app/utils/format';
import { OrderStatus, orderStatusColors, orderStatusText } from '@/app/utils/enums';

interface OrderListProps {
  orders: OrderModel[];
  loading?: boolean;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  loading = false,
  onStatusChange
}) => {
  const { hasRole } = useAuth();
  const canManageOrders = hasRole(['admin', 'waiter', 'cashier']);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record: OrderModel) => (
        <Link href={`/admin/orders/view/${record.id}`} className="text-blue-600 hover:text-blue-800">
          {text}
        </Link>
      ),
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'name'],
      key: 'table',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => formatPrice(total),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={orderStatusColors[status]}>
          {orderStatusText[status]}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
    },
  ];

  if (canManageOrders) {
    columns.push({
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: OrderModel) => (
        <Space>
          <Link href={`/admin/orders/view/${record.id}`}>
            <Button type="primary" size="small">
              Chi tiết
            </Button>
          </Link>
        </Space>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
      }}
    />
  );
};

export default OrderList;
