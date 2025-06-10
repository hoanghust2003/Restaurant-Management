'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  Breadcrumb, 
  Space, 
  Spin,
  message
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import OrderList from '@/app/components/order/OrderList';
import { orderService } from '@/app/services/order.service';
import { OrderModel } from '@/app/models/order.model';

const { Title } = Typography;

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load orders when page loads
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to fetch orders data
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Handle refreshing the orders list
  const handleRefresh = () => {
    fetchOrders();
  };

  // Handle creating a new order
  const handleCreateOrder = () => {
    router.push('/orders/new');
  };

  return (
    <div className="p-4">
      <Breadcrumb items={[
        { title: 'Trang chủ', href: '/' },
        { title: 'Đơn hàng' }
      ]} className="mb-4" />

      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Quản lý đơn hàng</Title>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateOrder}
            >
              Tạo đơn hàng mới
            </Button>
          </Space>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <OrderList 
            orders={orders} 
            onStatusChange={fetchOrders}
            showFilters={true}
          />
        )}
      </Card>
    </div>
  );
}
