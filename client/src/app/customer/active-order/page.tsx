"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { socketService } from '@/app/services/socket.service';
import { OrderStatus, OrderItemStatus } from '@/app/utils/enums';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { Card, Typography, Space, Tag, Progress, Flex, message } from 'antd';

const { Title, Text } = Typography;

export default function ActiveOrderPage() {
  const searchParams = useSearchParams();
  const orderSuccess = searchParams.get('orderSuccess');
  const [activeOrder, setActiveOrder] = useState<OrderModel | null>(null);

  // Handle order success message
  useEffect(() => {
    if (orderSuccess === 'true') {
      message.success({
        content: 'Đặt hàng thành công! Bạn có thể theo dõi tiến trình đơn hàng tại đây.',
        duration: 5,
      });
      
      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('orderSuccess');
      window.history.replaceState({}, '', url.toString());
    }
  }, [orderSuccess]);

  useEffect(() => {
    // Initialize socket with a user ID (you might need to get this from auth context)
    const userId = 'current-user-id'; // Replace with actual user ID
    socketService.initializeSocket(userId);
    
    // Subscribe to order status changes
    socketService.onOrderStatusChange((updatedOrder: OrderModel) => {
      setActiveOrder(updatedOrder);
    });

    socketService.onOrderItemStatusChange((updatedOrder: OrderModel) => {
      setActiveOrder(updatedOrder);
    });

    // Clean up
    return () => {
      socketService.disconnect();
    };
  }, []);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'default';
      case OrderStatus.IN_PROGRESS:
        return 'blue';
      case OrderStatus.READY:
        return 'green';
      case OrderStatus.SERVED:
        return 'purple';
      case OrderStatus.COMPLETED:
        return 'cyan';
      default:
        return 'default';
    }
  };

  const getItemStatusColor = (status: OrderItemStatus): "default" | "processing" | "success" | "error" | "warning" => {
    switch (status) {
      case OrderItemStatus.WAITING:
        return 'default';
      case OrderItemStatus.PREPARING:
        return 'processing';
      case OrderItemStatus.DONE:
        return 'success';
      case OrderItemStatus.FAILED:
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateProgress = (order: OrderModel | null) => {
    if (!order || !order.items || order.items.length === 0) return 0;
    const doneItems = order.items.filter((item: OrderItemModel) => item.status === OrderItemStatus.DONE).length;
    return (doneItems / order.items.length) * 100;
  };

  if (!activeOrder) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={4}>Không có đơn hàng đang hoạt động</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        Đơn hàng của bạn
      </Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>
            Đơn hàng #{activeOrder.id}
          </Title>
          <Tag 
            color={getStatusColor(activeOrder.status)}
          >
            {activeOrder.status}
          </Tag>
        </Flex>
        
        <Progress 
          percent={Math.round(calculateProgress(activeOrder))} 
          style={{ marginBottom: 16 }}
        />

        <Title level={5}>
          Các món ăn:
        </Title>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          {activeOrder.items && activeOrder.items.map((item: OrderItemModel) => (
            <Flex 
              key={item.id} 
              justify="space-between" 
              align="center"
            >
              <Text>
                {item.quantity}x {item.dish?.name || 'Món ăn'}
              </Text>
              <Tag 
                color={getItemStatusColor(item.status)}
              >
                {item.status}
              </Tag>
            </Flex>
          ))}
        </Space>
      </Card>
    </div>
  );
}
