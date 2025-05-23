'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  List,
  Tag,
  Space,
  Spin,
  Button,
  Empty,
  message,
  Modal,
  Input,
  Badge,
  Rate
} from 'antd';
import {
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import CustomerLayout from '@/app/layouts/CustomerLayout';
import { orderService } from '@/app/services/order.service';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { OrderStatus, orderStatusText, orderStatusColors, OrderItemStatus, orderItemStatusText, orderItemStatusColors } from '@/app/utils/enums';
import { formatPrice, formatDateTime } from '@/app/utils/format';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { confirm } = Modal;

export default function CustomerActiveOrdersPage() {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  // Load active orders when page loads
  useEffect(() => {
    fetchActiveOrders();
    
    // Auto refresh every 30 seconds to get real-time updates
    const interval = setInterval(() => {
      fetchActiveOrders(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch active orders from API
  const fetchActiveOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Get orders that are not completed or cancelled
      const filters = {
        status: `${OrderStatus.PENDING},${OrderStatus.IN_PROGRESS},${OrderStatus.READY},${OrderStatus.SERVED}`
      };
      
      const data = await orderService.getAll(filters);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching active orders:', error);
      if (showLoading) message.error('Không thể tải danh sách đơn hàng');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Calculate estimated wait time for an order
  const calculateWaitTime = (order: OrderModel): number => {
    if (!order.items || order.items.length === 0) return 0;
    
    // Find the max preparation time among all items
    return Math.max(
      ...order.items.map(item => {
        // If the item is already done, return 0
        if (item.status === OrderItemStatus.DONE) return 0;
        
        // If the item is preparing, return half the preparation time
        if (item.status === OrderItemStatus.PREPARING) {
          return Math.ceil((item.dish?.preparation_time || 0) / 2);
        }
        
        // If the item is waiting, return the full preparation time
        return item.dish?.preparation_time || 0;
      })
    );
  };

  // Calculate progress percentage for an order
  const calculateProgress = (order: OrderModel): number => {
    if (!order.items || order.items.length === 0) return 0;
    
    const totalItems = order.items.length;
    const doneItems = order.items.filter(item => 
      item.status === OrderItemStatus.DONE
    ).length;
    
    return Math.round((doneItems / totalItems) * 100);
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (!currentOrderId) return;
    
    try {
      setSubmitLoading(true);
      
      // Submit feedback to API
      await orderService.submitFeedback(currentOrderId, feedbackText, feedbackRating);
      
      message.success('Cảm ơn bạn đã gửi đánh giá!');
      setFeedbackModalVisible(false);
      
      // Refresh orders to update UI
      await fetchActiveOrders();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Open feedback modal for a specific order
  const showFeedbackModal = (orderId: string) => {
    setCurrentOrderId(orderId);
    setFeedbackText('');
    setFeedbackRating(5);
    setFeedbackModalVisible(true);
  };

  // Render order item status
  const renderItemStatus = (status: OrderItemStatus) => {
    return (
      <Tag color={orderItemStatusColors[status]}>
        {orderItemStatusText[status]}
      </Tag>
    );
  };

  return (
    <CustomerLayout>
      <div className="p-6">
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Title level={2} className="m-0">Đơn hàng đang hoạt động</Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchActiveOrders()}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Spin size="large" tip="Đang tải đơn hàng..." />
            </div>
          ) : orders.length > 0 ? (
            <List
              dataSource={orders}
              renderItem={(order) => {
                const waitTime = calculateWaitTime(order);
                const progress = calculateProgress(order);
                
                return (
                  <List.Item key={order.id}>
                    <Card
                      className="w-full"
                      title={
                        <div className="flex justify-between items-center">
                          <Text strong>Đơn #{order.code || order.id.substring(0, 8)}</Text>
                          <Tag color={orderStatusColors[order.status]}>
                            {orderStatusText[order.status]}
                          </Tag>
                        </div>
                      }
                    >
                      <div className="mb-4">
                        <Space className="mb-2">
                          <Text type="secondary">Thời gian đặt:</Text>
                          <Text>{formatDateTime(order.created_at)}</Text>
                        </Space>
                        <div>
                          <Text type="secondary">Bàn:</Text>
                          <Text strong> {order.table?.name || `Bàn #${order.tableId}`}</Text>
                        </div>
                      </div>
                      
                      <List
                        header={<div>Danh sách món</div>}
                        bordered
                        dataSource={order.items || []}
                        renderItem={(item) => (
                          <List.Item
                            key={item.id}
                            extra={renderItemStatus(item.status)}
                          >
                            <List.Item.Meta
                              avatar={
                                <ImageWithFallback
                                  src={item.dish?.image_url}
                                  type="dishes"
                                  alt={item.dish?.name}
                                  width={48}
                                  height={48}
                                  className="object-cover rounded"
                                />
                              }
                              title={
                                <Space>
                                  <Text>{item.dish?.name}</Text>
                                  <Badge count={`x${item.quantity}`} style={{ backgroundColor: '#52c41a' }} />
                                </Space>
                              }
                              description={item.note && `Ghi chú: ${item.note}`}
                            />
                          </List.Item>
                        )}
                      />
                      
                      <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <Text className="text-lg">Tổng tiền:</Text>
                          <Title level={4} className="m-0 text-red-500">
                            {formatPrice(order.total_price)}
                          </Title>
                        </div>
                        
                        <Space className="mt-4 md:mt-0">
                          {order.status === OrderStatus.SERVED && (
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              onClick={() => showFeedbackModal(order.id)}
                            >
                              Đánh giá đơn hàng
                            </Button>
                          )}
                          
                          {waitTime > 0 && order.status !== OrderStatus.SERVED && (
                            <Button icon={<ClockCircleOutlined />} disabled>
                              Dự kiến hoàn thành trong {waitTime} phút
                            </Button>
                          )}
                          
                          {progress > 0 && progress < 100 && (
                            <Text type="secondary">Tiến độ: {progress}% món ăn đã hoàn thành</Text>
                          )}
                        </Space>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="Bạn không có đơn hàng đang hoạt động nào"
            >
              <Button type="primary" href="/customer/menu">
                Đặt món ngay
              </Button>
            </Empty>
          )}
        </Card>
        
        <Modal
          title="Đánh giá đơn hàng"
          visible={feedbackModalVisible}
          onCancel={() => setFeedbackModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setFeedbackModalVisible(false)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={submitLoading}
              onClick={handleSubmitFeedback}
            >
              Gửi đánh giá
            </Button>
          ]}
        >
          <div className="mb-4">
            <Text>Xin hãy đánh giá chất lượng món ăn và dịch vụ:</Text>
            <div className="my-2">
              <Rate
                allowHalf
                defaultValue={5}
                value={feedbackRating}
                onChange={(value) => setFeedbackRating(value)}
              />
            </div>
          </div>
          
          <TextArea
            rows={4}
            placeholder="Nhập nhận xét của bạn về món ăn và dịch vụ..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </Modal>
      </div>
    </CustomerLayout>
  );
}
