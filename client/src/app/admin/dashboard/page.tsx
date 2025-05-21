'use client';

import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { 
  UserOutlined, 
  ShopOutlined, 
  DollarOutlined,
  ShoppingCartOutlined 
} from '@ant-design/icons';
import AdminLayout from '@/app/layouts/AdminLayout';
import { useAuth } from '@/app/contexts/AuthContext';
import CustomLink from '@/app/components/CustomLink';

const AdminDashboard = () => {
  const { user } = useAuth();

  const statistics = [
    {
      title: 'Tổng người dùng',
      value: 125,
      icon: <UserOutlined />,
      color: '#1890ff',
      link: '/admin/users'
    },
    {
      title: 'Đơn hàng hôm nay',
      value: 25,
      icon: <ShoppingCartOutlined />,
      color: '#52c41a',
      link: '/admin/orders'
    },
    {
      title: 'Doanh thu hôm nay',
      value: 5200000,
      prefix: '₫',
      icon: <DollarOutlined />,
      color: '#faad14',
      link: '/admin/financial/daily'
    },
    {
      title: 'Món ăn đang phục vụ',
      value: 45,
      icon: <ShopOutlined />,
      color: '#eb2f96',
      link: '/admin/dishes'
    }
  ];

  return (
    <AdminLayout title="Bảng điều khiển">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Xin chào, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Đây là tổng quan hoạt động của nhà hàng
          </p>
        </div>

        <Row gutter={[16, 16]}>          {statistics.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <CustomLink href={stat.link}>
                <Card 
                  hoverable 
                  className="h-full"
                  style={{ borderLeft: `4px solid ${stat.color}` }}
                >
                  <Statistic
                    title={
                      <span className="flex items-center gap-2">
                        {stat.icon}
                        {stat.title}
                      </span>
                    }
                    value={stat.value}
                    prefix={stat.prefix}
                    valueStyle={{ color: stat.color }}
                  />
                </Card>
              </CustomLink>
            </Col>
          ))}
        </Row>

        <div className="mt-8">
          <Row gutter={[16, 16]}>            <Col xs={24} lg={16}>
              <Card title="Đơn hàng gần đây" extra={<CustomLink href="/admin/orders">Xem tất cả</CustomLink>}>
                {/* RecentOrders component sẽ được thêm sau */}
                <p className="text-gray-600">Đang tải dữ liệu đơn hàng...</p>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Thông báo" extra={<Button type="link">Xem tất cả</Button>}>
                {/* Notifications component sẽ được thêm sau */}
                <p className="text-gray-600">Không có thông báo mới</p>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
