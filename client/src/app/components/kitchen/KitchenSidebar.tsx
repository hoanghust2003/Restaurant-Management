'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import { DesktopOutlined, ClockCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const { Sider } = Layout;

const KitchenSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    {
      key: '/kitchen',
      icon: <DesktopOutlined />,
      label: 'Màn hình chính',
    },
    {
      key: '/kitchen/active',
      icon: <ClockCircleOutlined />,
      label: 'Đơn đang thực hiện',
    },
    {
      key: '/kitchen/history',
      icon: <HistoryOutlined />,
      label: 'Lịch sử đơn hàng',
    },
  ];

  return (
    <Sider
      collapsible
      breakpoint="lg"
      className="min-h-screen"
      theme="light"
    >
      <div className="p-4 text-center">
        <img 
          src={`${API_BASE_URL.replace('/api', '')}/uploads/logo.png`}
          alt="Logo"
          className="w-32 h-auto mx-auto"
        />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={items}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );
};

export default KitchenSidebar;
