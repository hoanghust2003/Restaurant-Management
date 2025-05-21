'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, DatePicker, Select, message } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import AdminLayout from '@/app/layouts/AdminLayout';
import { OrderModel } from '@/app/models/order.model';
import { orderService } from '@/app/services/order.service';
import { useRouter } from 'next/navigation';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'gold',
      preparing: 'processing',
      ready: 'cyan',
      served: 'blue',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: 'Chờ xử lý',
      preparing: 'Đang chuẩn bị',
      ready: 'Sẵn sàng',
      served: 'Đã phục vụ',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'number'],
      key: 'table',
      render: (number: string) => `Bàn ${number}`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => `${amount.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: OrderModel) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/admin/orders/${record.id}`)}
          />
          <Button
            type="text"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintOrder(record.id)}
          />
        </Space>
      ),
    },
  ];

  const handlePrintOrder = (orderId: string) => {
    // TODO: Implement order printing
    message.info('Chức năng in đơn hàng đang được phát triển');
  };

  return (
    <AdminLayout title="Quản lý đơn hàng">
      <div className="p-6">
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Tìm kiếm theo mã đơn..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={e => setSearchText(e.target.value)}
            />
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 300 }}
            />
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">Chờ xử lý</Option>
              <Option value="preparing">Đang chuẩn bị</Option>
              <Option value="ready">Sẵn sàng</Option>
              <Option value="served">Đã phục vụ</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default OrderManagement;
