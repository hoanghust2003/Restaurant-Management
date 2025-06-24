'use client';

import React from 'react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { PlusOutlined } from '@ant-design/icons';

const TestCreateButton = () => {
  const router = useRouter();

  const handleClick = () => {
    console.log('Test button clicked, navigating to /admin/tables/create');
    router.push('/admin/tables/create');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Create Button</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleClick}
      >
        Test Thêm bàn mới
      </Button>
    </div>
  );
};

export default TestCreateButton;
