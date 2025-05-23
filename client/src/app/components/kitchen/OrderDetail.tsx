'use client';

import React, { useState } from 'react';
import { Card, Typography, List, Tag, Button, Space, Steps, message, Divider } from 'antd';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { useSocket } from '@/app/contexts/SocketContext';
import { formatPrice } from '@/app/utils/format';
import { OrderStatus, OrderItemStatus } from '@/app/utils/enums';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title, Text } = Typography;

interface OrderDetailProps {
  order: OrderModel;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onBack }) => {
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);

  const handleUpdateItemStatus = async (itemId: string, status: OrderItemStatus) => {
    if (!socket) return;

    try {
      setLoading(true);
      socket.emit('kitchen:update_item', {
        orderId: order.id,
        itemId: itemId,
        status: status
      });
      message.success('Đã cập nhật trạng thái món');
    } catch (error) {
      console.error('Error updating item status:', error);
      message.error('Không thể cập nhật trạng thái món');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (status: OrderStatus) => {
    if (!socket) return;

    try {
      setLoading(true);
      socket.emit('kitchen:update_order', {
        orderId: order.id,
        status: status
      });
      message.success('Đã cập nhật trạng thái đơn hàng');
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Không thể cập nhật trạng thái đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'completed':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const getItemStatusColor = (status: OrderItemStatus) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'preparing':
        return 'processing';
      case 'ready':
        return 'success';
      case 'completed':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Title level={4}>Chi tiết đơn hàng #{order.code}</Title>
        <Button onClick={onBack}>Quay lại</Button>
      </div>

      <Space direction="vertical" className="w-full">
        <Card size="small" className="mb-4">
          <div className="flex justify-between">
            <div>
              <Text strong>Bàn: </Text>
              <Text>{order.table?.name}</Text>
            </div>
            <div>
              <Text strong>Thời gian: </Text>
              <Text>{new Date(order.created_at).toLocaleString('vi-VN')}</Text>
            </div>
          </div>
        </Card>

        <Steps
          current={getStatusStep(order.status)}
          items={[
            { title: 'Chờ xử lý' },
            { title: 'Đang chuẩn bị' },
            { title: 'Sẵn sàng' },
            { title: 'Hoàn thành' },
          ]}
          className="mb-6"
        />

        <List
          header={<Title level={5}>Danh sách món</Title>}
          dataSource={order.items}
          renderItem={(item: OrderItemModel) => (
            <List.Item key={item.id}>
              <div className="flex w-full">
                <div className="flex-shrink-0 mr-4">
                  <ImageWithFallback
                    src={item.dish?.image_url}
                    alt={item.dish?.name}
                    width={80}
                    height={80}
                    type="dishes"
                    className="rounded-lg"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong>{item.dish?.name}</Text>
                      <div>
                        <Text type="secondary">x{item.quantity}</Text>
                        {item.note && (
                          <Tag color="blue" className="ml-2">
                            Ghi chú: {item.note}
                          </Tag>
                        )}
                      </div>
                    </div>
                    <Space>
                      <Tag color={getItemStatusColor(item.status)}>
                        {item.status === 'pending' && 'Chờ xử lý'}
                        {item.status === 'preparing' && 'Đang chuẩn bị'}
                        {item.status === 'ready' && 'Sẵn sàng'}
                        {item.status === 'completed' && 'Hoàn thành'}
                        {item.status === 'cancelled' && 'Đã hủy'}
                      </Tag>
                      {item.status === 'pending' && (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleUpdateItemStatus(item.id, 'preparing')}
                          loading={loading}
                        >
                          Bắt đầu chuẩn bị
                        </Button>
                      )}
                      {item.status === 'preparing' && (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleUpdateItemStatus(item.id, 'ready')}
                          loading={loading}
                        >
                          Đánh dấu sẵn sàng
                        </Button>
                      )}
                    </Space>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />

        <Divider />

        <div className="flex justify-end">
          <Space>
            {order.status === 'pending' && (
              <Button
                type="primary"
                onClick={() => handleUpdateOrderStatus('preparing')}
                loading={loading}
              >
                Bắt đầu chuẩn bị
              </Button>
            )}
            {order.status === 'preparing' && (
              <Button
                type="primary"
                onClick={() => handleUpdateOrderStatus('ready')}
                loading={loading}
              >
                Đánh dấu sẵn sàng phục vụ
              </Button>
            )}
            {order.status === 'ready' && (
              <Button
                type="primary"
                onClick={() => handleUpdateOrderStatus('completed')}
                loading={loading}
              >
                Hoàn thành đơn
              </Button>
            )}
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default OrderDetail;
