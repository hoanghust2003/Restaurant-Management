'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  Breadcrumb, 
  Space, 
  Spin,
  message,
  Result
} from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import OrderDetail from '@/app/components/order/OrderDetail';
import { orderService } from '@/app/services/order.service';
import { OrderModel } from '@/app/models/order.model';

const { Title } = Typography;

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const router = useRouter();

  // Load order data when page loads
  useEffect(() => {
    const initializeData = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };
    initializeData();
  }, [params]);

  // Fetch data when orderId is available
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Function to fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Không thể tải thông tin đơn hàng');
      message.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Handle order status change
  const handleStatusChange = () => {
    fetchOrderDetails();
  };

  // Handle back button
  const handleBack = () => {
    router.push('/orders');
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[500px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4">
        <Result
          status="404"
          title="Không tìm thấy đơn hàng"
          subTitle="Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          extra={
            <Button type="primary" onClick={handleBack}>
              Quay lại danh sách đơn hàng
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Breadcrumb items={[
        { title: 'Trang chủ', href: '/' },
        { title: 'Đơn hàng', href: '/orders' },
        { title: `Đơn hàng ${order.code || orderId.substring(0, 8)}` }
      ]} className="mb-4" />

      <div className="mb-4 flex items-center justify-between">
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
          >
            Quay lại
          </Button>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchOrderDetails}
          >
            Làm mới
          </Button>
        </Space>
        <Title level={3} className="mb-0">
          Chi tiết đơn hàng {order.code || orderId.substring(0, 8)}
        </Title>
      </div>

      <OrderDetail 
        order={order} 
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
