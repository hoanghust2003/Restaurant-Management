'use client';

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Button, 
  Card, 
  Breadcrumb, 
  Space, 
  Spin,
  message,
  Tabs,
  Result
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderForm from '@/app/components/order/OrderForm';
import { tableService } from '@/app/services/table.service';
import { TableModel } from '@/app/models/table.model';

const { Title } = Typography;

export default function NewOrderPage() {
  const [table, setTable] = useState<TableModel | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams?.get('tableId');

  // If tableId is provided, fetch table details
  useEffect(() => {
    if (tableId) {
      fetchTable(tableId);
    }
  }, [tableId]);

  // Fetch table details
  const fetchTable = async (id: string) => {
    try {
      setLoading(true);
      const data = await tableService.getById(id);
      setTable(data);
    } catch (error) {
      console.error('Error fetching table details:', error);
      message.error('Không thể tải thông tin bàn');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful order creation
  const handleOrderSuccess = () => {
    message.success('Đơn hàng đã được tạo thành công');
    router.push('/orders');
  };

  // Handle back button
  const handleBack = () => {
    router.push('/orders');
  };

  return (
    <div className="p-4">
      <Breadcrumb items={[
        { title: 'Trang chủ', href: '/' },
        { title: 'Đơn hàng', href: '/orders' },
        { title: 'Tạo đơn hàng mới' }
      ]} className="mb-4" />

      <div className="mb-4 flex items-center justify-between">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          Quay lại
        </Button>
        <Title level={3} className="mb-0">
          Tạo đơn hàng mới {table ? `- ${table.name}` : ''}
        </Title>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <OrderForm 
            tableId={tableId || undefined} 
            onSuccess={handleOrderSuccess} 
          />
        )}
      </Card>
    </div>
  );
}
