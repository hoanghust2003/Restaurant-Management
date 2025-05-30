'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Tabs, 
  Input, 
  Select, 
  Space, 
  Button, 
  Row, 
  Col,
  Empty,
  Spin,
  Badge,
  message
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import KitchenLayout from '@/app/layouts/KitchenLayout';
import KitchenStats from '@/app/components/kitchen/KitchenStats';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';
import { useKitchen } from '@/app/contexts/KitchenContext';
import { OrderModel } from '@/app/models/order.model';
import { OrderStatus, OrderItemStatus } from '@/app/utils/enums';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function KitchenDashboard() {
  const { orders, loading, refreshOrders, updateItemStatus, updateOrderStatus } = useKitchen();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');
  const [filteredOrders, setFilteredOrders] = useState<OrderModel[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [activeTab, setActiveTab] = useState('pending');

  // Initial load and set up periodic refresh
  useEffect(() => {
    refreshOrders();
    setLastRefreshed(new Date());

    const interval = setInterval(() => {
      refreshOrders();
      setLastRefreshed(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshOrders]);

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];
    
    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(order => 
        order.code?.toLowerCase().includes(searchText.toLowerCase()) ||
        order.items?.some((item: { dish?: { name: string } }) => 
          item.dish?.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }

    // Filter by status
    filtered = filtered.filter(order => order.status === activeTab);
    
    // Sort orders
    filtered.sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        // Priority sorting based on waiting time
        const getWaitingTime = (order: OrderModel) => {
          return Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / 60000);
        };
        return getWaitingTime(b) - getWaitingTime(a);
      }
    });
    
    setFilteredOrders(filtered);
  }, [orders, searchText, sortBy, activeTab]);

  // Render time since last refresh
  const renderLastRefreshed = () => {
    const minutes = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 60000);
    return minutes === 0 ? 'vừa cập nhật' : `${minutes} phút trước`;
  };

  // Add search and sort controls to render
  const renderControls = () => (
    <Space className="mb-4 w-full justify-between">
      <Space>
        <Input
          placeholder="Tìm kiếm đơn hàng..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          value={sortBy}
          onChange={setSortBy}
          style={{ width: 150 }}
          options={[
            { label: 'Theo thời gian', value: 'time' },
            { label: 'Theo độ ưu tiên', value: 'priority' }
          ]}
        />
      </Space>
      <Space>
        <span>Cập nhật: {renderLastRefreshed()}</span>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={refreshOrders}
          loading={loading}
        >
          Làm mới
        </Button>
      </Space>
    </Space>
  );

  return (
    <KitchenLayout title="Màn hình bếp">
      <div className="p-4">
        {renderControls()}
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="order-tabs"
        >
          <TabPane 
            tab={
              <Badge count={filteredOrders.length} offset={[10, 0]}>
                <span className="px-2">Đơn đang chờ</span>
              </Badge>
            } 
            key={OrderStatus.PENDING}
          >
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <Row gutter={[16, 16]}>
                {filteredOrders.map(order => (
                  <Col xs={24} lg={12} xl={8} key={order.id}>
                    <KitchenOrderCard
                      order={order}
                      onUpdateItem={updateItemStatus}
                      onUpdateOrder={updateOrderStatus}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty 
                description={
                  searchText 
                    ? "Không tìm thấy đơn hàng phù hợp"
                    : "Không có đơn hàng nào đang chờ xử lý"
                }
                className="py-8"
              />
            )}
          </TabPane>
          
          <TabPane 
            tab="Đơn đã sẵn sàng" 
            key={OrderStatus.READY}
          >
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <Row gutter={[16, 16]}>
                {filteredOrders.map(order => (
                  <Col xs={24} lg={12} xl={8} key={order.id}>
                    <KitchenOrderCard
                      order={order}
                      onUpdateItem={updateItemStatus}
                      onUpdateOrder={updateOrderStatus}
                    />
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
      </div>
      
      <audio id="notificationSound" src="/sounds/notification.mp3" />
    </KitchenLayout>
  );
}
