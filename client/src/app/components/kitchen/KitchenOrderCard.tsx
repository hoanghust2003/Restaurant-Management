'use client';

import React from 'react';
import { Card, Tag, List, Button, Space, Tooltip, Badge } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { OrderStatus, OrderItemStatus, orderItemStatusText } from '@/app/utils/enums';
import { formatPrice } from '@/app/utils/format';
import moment from 'moment';

interface KitchenOrderCardProps {
  order: OrderModel;
  onUpdateItem: (orderId: string, itemId: string, status: OrderItemStatus) => void;
  onUpdateOrder: (orderId: string, status: OrderStatus) => void;
  loading?: boolean;
}

const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  onUpdateItem,
  onUpdateOrder,
  loading = false
}) => {
  // Calculate order status and completion
  const allItemsPrepared = order.items?.every(
    item => item.status === OrderItemStatus.DONE
  );
  const allItemsStarted = order.items?.every(
    item => item.status !== OrderItemStatus.WAITING
  );
  // Trạng thái hiển thị cho từng món
  const getItemStatusBadge = (status: OrderItemStatus) => {
    switch (status) {
      case OrderItemStatus.WAITING:
        return <Badge status="warning" text={orderItemStatusText[status]} />;
      case OrderItemStatus.PREPARING:
        return <Badge status="processing" text={orderItemStatusText[status]} />;
      case OrderItemStatus.DONE:
        return <Badge status="success" text={orderItemStatusText[status]} />;
      case OrderItemStatus.FAILED:
        return <Badge status="error" text={orderItemStatusText[status]} />;
      default:
        return <Badge status="default" text="Không xác định" />;
    }
  };

  // Tính thời gian chờ
  const getWaitingTime = (createdAt: Date) => {
    const duration = moment.duration(moment().diff(moment(createdAt)));
    return Math.floor(duration.asMinutes());
  };

  return (
    <Card
      title={
        <Space className="w-full justify-between">
          <span>Đơn #{order.code || order.id.substring(0, 8)}</span>
          <Tag color={getWaitingTime(order.created_at) > 15 ? 'red' : 'green'}>
            {getWaitingTime(order.created_at)} phút
          </Tag>
        </Space>
      }
      className="kitchen-order-card"
    >
      <List
        size="small"
        dataSource={order.items}
        renderItem={(item: OrderItemModel) => (
          <List.Item
            className="flex justify-between items-center"            actions={[
              <Space key="actions">
                {item.status !== OrderItemStatus.DONE && (
                  <>
                    {item.status === OrderItemStatus.WAITING && (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() =>
                          onUpdateItem(order.id, item.id, OrderItemStatus.PREPARING)
                        }
                        loading={loading}
                      >
                        Bắt đầu chế biến
                      </Button>
                    )}
                    {item.status === OrderItemStatus.PREPARING && (
                      <Space>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() =>
                            onUpdateItem(order.id, item.id, OrderItemStatus.DONE)
                          }
                          loading={loading}
                        >
                          Hoàn thành
                        </Button>
                        <Button
                          danger
                          size="small"
                          onClick={() =>
                            onUpdateItem(order.id, item.id, OrderItemStatus.FAILED)
                          }
                          loading={loading}
                        >
                          Thất bại
                        </Button>
                      </Space>
                    )}
                  </>
                )}
              </Space>,
            ]}
          >
            <Space direction="vertical" size="small" className="w-full">
              <Space className="w-full justify-between">
                <span className="font-medium">
                  {item.quantity}x {item.dish?.name}
                </span>
                {getItemStatusBadge(item.status)}
              </Space>
              {item.note && (
                <Tag color="blue">
                  Ghi chú: {item.note}
                </Tag>
              )}
            </Space>
          </List.Item>
        )}
      />
      
      {/* Card footer with order actions */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          {order.status === OrderStatus.IN_PROGRESS && (
            <Tag color="processing">Đang chế biến</Tag>
          )}
          {order.status === OrderStatus.READY && (
            <Tag color="success">Sẵn sàng phục vụ</Tag>
          )}
        </div>
        
        <Space>
          {order.status === OrderStatus.PENDING && (
            <Button
              type="primary"
              onClick={() => onUpdateOrder(order.id, OrderStatus.IN_PROGRESS)}
              loading={loading}
            >
              Bắt đầu chế biến
            </Button>
          )}
          {order.status === OrderStatus.IN_PROGRESS && allItemsPrepared && (
            <Button
              type="primary"
              onClick={() => onUpdateOrder(order.id, OrderStatus.READY)}
              loading={loading}
            >
              Đánh dấu sẵn sàng
            </Button>
          )}
          {order.status === OrderStatus.READY && (
            <Button
              type="primary"
              ghost
              onClick={() => onUpdateOrder(order.id, OrderStatus.COMPLETED)}
              loading={loading}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      </div>

      <style jsx global>{`
        .kitchen-order-card .ant-card-head {
          background-color: #f5f5f5;
          padding: 8px 16px;
        }
        .kitchen-order-card .ant-card-head-title {
          padding: 8px 0;
        }
        .kitchen-order-card .ant-list-item {
          padding: 12px 0;
        }
      `}</style>
    </Card>
  );
};

export default KitchenOrderCard;
