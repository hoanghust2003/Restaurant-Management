'use client';

import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useKitchen } from '@/app/contexts/KitchenContext';
import { OrderStatus } from '@/app/utils/enums';

const KitchenStats: React.FC = () => {
  const { orders } = useKitchen();

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const preparingOrders = orders.filter(o => o.status === OrderStatus.IN_PROGRESS).length;
  const readyOrders = orders.filter(o => o.status === OrderStatus.READY).length;
  
  // Calculate average waiting time for pending orders
  const getAverageWaitTime = () => {
    const pendingOrdersList = orders.filter(o => o.status === OrderStatus.PENDING);
    if (pendingOrdersList.length === 0) return 0;
    
    const totalWaitTime = pendingOrdersList.reduce((acc, order) => {
      const waitTime = new Date().getTime() - new Date(order.created_at).getTime();
      return acc + (waitTime / 60000); // Convert to minutes
    }, 0);
    
    return Math.round(totalWaitTime / pendingOrdersList.length);
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Đơn đang chờ"
            value={pendingOrders}
            prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Đang chế biến"
            value={preparingOrders}
            prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Sẵn sàng phục vụ"
            value={readyOrders}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Thời gian chờ TB"
            value={getAverageWaitTime()}
            suffix="phút"
            valueStyle={
              getAverageWaitTime() > 15 
                ? { color: '#f5222d' }
                : getAverageWaitTime() > 10
                  ? { color: '#faad14' }
                  : { color: '#52c41a' }
            }
          />
        </Card>
      </Col>
    </Row>
  );
};

export default KitchenStats;
