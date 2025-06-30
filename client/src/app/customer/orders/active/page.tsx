'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Typography, message, Button, Space, Empty } from 'antd';
import { ReloadOutlined, HistoryOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { orderService } from '@/app/services/order.service';
import { formatPrice, formatDateTime } from '@/app/utils/format';
import { OrderStatus, orderStatusText } from '@/app/utils/enums';
import { OrderModel } from '@/app/models/order.model';

const { Title } = Typography;

const ACTIVE_STATUSES = [OrderStatus.PENDING, OrderStatus.IN_PROGRESS];

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // Show success message if redirected from cart
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'order') {
      message.success('Đơn hàng của bạn đã được đặt thành công! Bạn có thể theo dõi tình trạng đơn hàng tại đây.');
    }
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
      render: (id: string) => `#${id.slice(0, 8)}`,
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'name'],
      key: 'tableName',
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'created_at',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Số món',
      dataIndex: 'items',
      key: 'itemCount',
      render: (items: any[]) => `${items.length} món`,
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={2} className="mb-2">Đơn hàng đang hoạt động</Title>
            <Typography.Text type="secondary">
              Theo dõi tình trạng các đơn hàng đang được xử lý
            </Typography.Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadOrders}
              loading={loading}
            >
              Làm mới
            </Button>
            <Link href="/customer/orders/history">
              <Button icon={<HistoryOutlined />}>
                Lịch sử đơn hàng
              </Button>
            </Link>
          </Space>
        </div>
        
        {orders.length === 0 && !loading ? (
          <Empty
            description="Bạn chưa có đơn hàng nào đang hoạt động"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link href="/customer/menu">
              <Button type="primary">Gọi món ngay</Button>
            </Link>
          </Empty>
        ) : (
          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  );
}
