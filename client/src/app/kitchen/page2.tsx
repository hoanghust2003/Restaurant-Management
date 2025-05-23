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
  Badge
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import KitchenLayout from '@/app/layouts/KitchenLayout';
import KitchenStats from '@/app/components/kitchen/KitchenStats';
import KitchenOrderCard from '@/app/components/kitchen/KitchenOrderCard';
import { useKitchen } from '@/app/contexts/KitchenContext';
import { OrderModel } from '@/app/models/order.model';
import { OrderStatus } from '@/app/utils/enums';

const { Title } = Typography;
const { TabPane } = Tabs;

export default function KitchenDashboard() {
  const { orders, loading, refreshOrders, updateItemStatus, updateOrderStatus } = useKitchen();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');
  const [filteredOrders, setFilteredOrders] = useState<OrderModel[]>([]);
  const [activeTab, setActiveTab] = useState<OrderStatus>(OrderStatus.IN_PROGRESS);

  // Filter and sort orders
  useEffect(() => {
    let filtered = [...orders];
    
    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(order => 
        order.code?.toLowerCase().includes(searchText.toLowerCase()) ||
        order.items?.some(item => 
          item.dish?.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
    
    // Filter by tab
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

  // Search and sort controls
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
      <Button 
        type="primary" 
        icon={<ReloadOutlined />} 
        onClick={refreshOrders}
        loading={loading}
      >
        Làm mới
      </Button>
    </Space>
  );

  const renderOrderList = (status: OrderStatus) => {
    const ordersToShow = filteredOrders.filter(order => order.status === status);

    if (loading) {
      return (
        <div className="text-center py-8">
          <Spin size="large" />
        </div>
      );
    }

    if (ordersToShow.length === 0) {
      return (
        <Empty 
          description={
            searchText 
              ? "Không tìm thấy đơn hàng phù hợp"
              : "Không có đơn hàng nào"
          }
          className="py-8"
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {ordersToShow.map(order => (
          <Col xs={24} lg={12} xl={8} key={order.id}>
            <KitchenOrderCard
              order={order}
              onUpdateItem={updateItemStatus}
              onUpdateOrder={updateOrderStatus}
            />
          </Col>
        ))}
      </Row>
    );
  };

  const getOrderCount = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length;
  };

  return (
    <KitchenLayout>
      <div className="p-6">
        <Title level={2} className="mb-6">Quản lý bếp</Title>
        
        <KitchenStats />
        
        <div className="mt-6">
          {renderControls()}
          
          <Tabs 
            activeKey={activeTab}
            onChange={key => setActiveTab(key as OrderStatus)}
            className="kitchen-tabs"
          >
            <TabPane 
              tab={
                <Badge count={getOrderCount(OrderStatus.PENDING)} offset={[10, 0]}>
                  <span className="px-2">Đơn đang chờ</span>
                </Badge>
              } 
              key={OrderStatus.PENDING}
            >
              {renderOrderList(OrderStatus.PENDING)}
            </TabPane>
            
            <TabPane 
              tab={
                <Badge count={getOrderCount(OrderStatus.PREPARING)} offset={[10, 0]}>
                  <span className="px-2">Đang chế biến</span>
                </Badge>
              }
              key={OrderStatus.PREPARING}
            >
              {renderOrderList(OrderStatus.PREPARING)}
            </TabPane>
            
            <TabPane 
              tab={
                <Badge count={getOrderCount(OrderStatus.READY)} offset={[10, 0]}>
                  <span className="px-2">Sẵn sàng phục vụ</span>
                </Badge>
              }
              key={OrderStatus.READY}
            >
              {renderOrderList(OrderStatus.READY)}
            </TabPane>
          </Tabs>
        </div>

        <style jsx global>{`
          .kitchen-tabs .ant-tabs-tab {
            padding: 12px 24px;
            margin: 0 8px 0 0;
          }
          .kitchen-tabs .ant-tabs-tab-active {
            background-color: #e6f7ff;
            border-radius: 4px 4px 0 0;
          }
          .kitchen-tabs .ant-tabs-content {
            padding: 16px 0;
          }
        `}</style>
      </div>
    </KitchenLayout>
  );
}
