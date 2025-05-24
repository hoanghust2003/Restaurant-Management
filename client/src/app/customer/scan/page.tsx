'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Typography, Button, message, Space, Alert } from 'antd';
import { QrcodeOutlined, MenuOutlined, CameraOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function QRScannerPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleManualEntry = () => {
    router.push('/customer/menu');
  };

  const handleScanDemo = () => {
    // For demo purposes, simulate scanning QR code and redirect to menu with a sample table ID
    const sampleTableId = 'sample-table-id';
    message.success('QR code đã được quét thành công!');
    router.push(`/customer/menu?tableId=${sampleTableId}`);
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <div className="mb-6">
            <QrcodeOutlined className="text-6xl text-blue-500 mb-4" />
            <Title level={2}>Quét mã QR</Title>
            <Paragraph className="text-gray-600">
              Quét mã QR trên bàn của bạn để xem thực đơn và đặt món trực tiếp
            </Paragraph>
          </div>

          <Alert
            message="Tính năng quét QR đang trong quá trình phát triển"
            description="Hiện tại bạn có thể sử dụng các tùy chọn dưới đây để truy cập thực đơn"
            type="info"
            showIcon
            className="mb-6"
          />

          <Space direction="vertical" size="large" className="w-full">
            <Button
              type="primary"
              size="large"
              icon={<CameraOutlined />}
              onClick={handleScanDemo}
              className="w-full h-12"
            >
              Quét QR Code (Demo)
            </Button>

            <Button
              size="large"
              icon={<MenuOutlined />}
              onClick={handleManualEntry}
              className="w-full h-12"
            >
              Xem thực đơn trực tiếp
            </Button>
          </Space>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Text type="secondary" className="text-sm">
              Nếu bạn không thể quét mã QR, vui lòng liên hệ nhân viên phục vụ để được hỗ trợ
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
