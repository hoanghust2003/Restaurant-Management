'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Input, DatePicker, Select, message } from 'antd';
import { SearchOutlined, EyeOutlined, PrinterOutlined } from '@ant-design/icons';
import AdminLayout from '@/app/layouts/AdminLayout';
import { OrderModel } from '@/app/models/order.model';
import { orderService } from '@/app/services/order.service';
import { OrderStatus, orderStatusText, orderStatusColors } from '@/app/utils/enums';
import { useRouter } from 'next/navigation';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderModel[] | null>(null);
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
    return orderStatusColors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    return orderStatusText[status] || status;
  };
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8),
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'name'],
      key: 'table',
      render: (name: string) => name || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (amount: number) => `${amount?.toLocaleString('vi-VN') || 0}₫`,
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
        <Space size="small">          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              // Use a custom approach to view order details without full page reloads
              router.push(`/admin/orders/${record.id}`);
            }}
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
          <div className="flex flex-wrap gap-4">            <Input
              placeholder="Tìm kiếm theo mã đơn..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={e => {
                setSearchText(e.target.value);
                if (e.target.value) {
                  const searchValue = e.target.value.toLowerCase();
                  const searchResults = orders.filter(order => 
                    (order.id && order.id.toLowerCase().includes(searchValue)) ||
                    (order.code && order.code.toLowerCase().includes(searchValue))
                  );
                  setFilteredOrders(searchResults);
                } else {
                  setFilteredOrders(null);
                }
              }}
            />            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 300 }}
              onChange={(dates, dateStrings) => {
                if (dates) {
                  const [startDate, endDate] = dates;
                  const filteredByDate = orders.filter(order => {
                    const orderDate = new Date(order.created_at);
                    return orderDate >= startDate!.toDate() && 
                           orderDate <= endDate!.endOf('day').toDate();
                  });
                  setFilteredOrders(filteredByDate);
                } else {
                  setFilteredOrders(null);
                }
              }}
            /><Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => {
                // When a status is selected, filter orders by that status
                if (value) {
                  const filteredOrders = orders.filter(order => order.status === value);
                  setFilteredOrders(filteredOrders);
                } else {
                  setFilteredOrders(null); // Reset filters
                }
              }}
            >
              <Option value={OrderStatus.PENDING}>{orderStatusText[OrderStatus.PENDING]}</Option>
              <Option value={OrderStatus.IN_PROGRESS}>{orderStatusText[OrderStatus.IN_PROGRESS]}</Option>
              <Option value={OrderStatus.READY}>{orderStatusText[OrderStatus.READY]}</Option>
              <Option value={OrderStatus.SERVED}>{orderStatusText[OrderStatus.SERVED]}</Option>
              <Option value={OrderStatus.COMPLETED}>{orderStatusText[OrderStatus.COMPLETED]}</Option>              <Option value={OrderStatus.CANCELED}>{orderStatusText[OrderStatus.CANCELED]}</Option>
            </Select>
            <Button 
              type="default"
              onClick={() => {
                setFilteredOrders(null);
                setSearchText('');
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>        <Table
          columns={columns}
          dataSource={filteredOrders || orders}
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
