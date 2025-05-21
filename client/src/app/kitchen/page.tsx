'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Tabs, 
  Button, 
  Spin, 
  Space, 
  message, 
  Badge, 
  Empty,
  Row,
  Col
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { orderService } from '@/app/services/order.service';
import { OrderModel } from '@/app/models/order.model';
import { OrderStatus, OrderItemStatus } from '@/app/utils/enums';
import OrderDetail from '@/app/components/order/OrderDetail';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function KitchenView() {
  const [activeOrders, setActiveOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Load orders when page loads or tab changes
  useEffect(() => {
    fetchOrders();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab]);
  
  // Function to fetch orders based on current tab
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // For active tab, get pending and in-progress orders
      const filters = activeTab === 'active' 
        ? { status: OrderStatus.PENDING } 
        : { status: OrderStatus.READY };
      
      const data = await orderService.getAll(filters);
      setActiveOrders(data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchOrders();
    message.success('Đã cập nhật danh sách đơn hàng');
  };
  
  // Handle order status change
  const handleOrderStatusChange = () => {
    fetchOrders();
  };

  // Render time since last refresh
  const renderLastRefreshed = () => {
    const minutes = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 60000);
    return minutes === 0 ? 'vừa cập nhật' : `${minutes} phút trước`;
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={2}>Màn hình bếp</Title>
        <Space>
          <span>Cập nhật: {renderLastRefreshed()}</span>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="order-tabs"
      >
        <TabPane 
          tab={
            <Badge count={activeOrders.length} offset={[10, 0]}>
              <span className="px-2">Đơn đang chờ</span>
            </Badge>
          } 
          key="active"
        >
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : activeOrders.length > 0 ? (
            <Row gutter={[16, 16]}>
              {activeOrders.map(order => (
                <Col xs={24} lg={12} xl={8} key={order.id}>
                  <Card className="mb-4 kitchen-order-card">
                    <OrderDetail 
                      order={order} 
                      onStatusChange={handleOrderStatusChange}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description="Không có đơn hàng nào đang chờ xử lý"
              className="py-8"
            />
          )}
        </TabPane>
        
        <TabPane 
          tab="Đơn đã sẵn sàng" 
          key="ready"
        >
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : activeOrders.length > 0 ? (
            <Row gutter={[16, 16]}>
              {activeOrders.map(order => (
                <Col xs={24} lg={12} xl={8} key={order.id}>
                  <Card className="mb-4 kitchen-order-card">
                    <OrderDetail 
                      order={order} 
                      onStatusChange={handleOrderStatusChange}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description="Không có đơn hàng nào đã sẵn sàng"
              className="py-8"
            />
          )}
        </TabPane>
      </Tabs>
      
      <style jsx global>{`
        .kitchen-order-card .ant-card-body {
          padding: 12px;
        }
        
        .order-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
}
