'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, Table, Tag, Descriptions, Button, Skeleton, message, Modal, Divider } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/layouts/AdminLayout';
import { orderService } from '@/app/services/order.service';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { OrderStatus, OrderItemStatus, orderStatusText, orderStatusColors, orderItemStatusText, orderItemStatusColors } from '@/app/utils/enums';

const OrderDetailPage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(id);
      setOrder(data);
    } catch (error) {
      console.error('Error loading order details:', error);
      message.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrder = () => {
    // TODO: Implement printing functionality
    message.info('Chức năng in đơn hàng đang được phát triển');
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(id, newStatus);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating order status:', error);
      message.error('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const confirmStatusChange = (newStatus: OrderStatus) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc muốn chuyển trạng thái đơn hàng sang ${orderStatusText[newStatus]}?`,
      onOk: () => handleUpdateStatus(newStatus),
    });
  };

  const orderItemColumns = [
    {
      title: 'Món',
      dataIndex: ['dish', 'name'],
      key: 'dish',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
    {
      title: 'Đơn giá',
      dataIndex: ['dish', 'price'],
      key: 'price',
      render: (price: number) => `${price.toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_: any, record: OrderItemModel) => 
        `${(record.quantity * (record.dish?.price || 0)).toLocaleString('vi-VN')}₫`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderItemStatus) => (
        <Tag color={orderItemStatusColors[status]}>
          {orderItemStatusText[status]}
        </Tag>
      ),
    },
  ];

  const renderActionButtons = () => {
    if (!order) return null;

    const buttons = [];
    
    switch(order.status) {
      case OrderStatus.PENDING:
        buttons.push(
          <Button key="progress" type="primary" onClick={() => confirmStatusChange(OrderStatus.IN_PROGRESS)}>
            Chuyển sang chế biến
          </Button>
        );
        buttons.push(
          <Button key="cancel" danger onClick={() => confirmStatusChange(OrderStatus.CANCELED)}>
            Hủy đơn
          </Button>
        );
        break;
      case OrderStatus.IN_PROGRESS:
        buttons.push(
          <Button key="ready" type="primary" onClick={() => confirmStatusChange(OrderStatus.READY)}>
            Đánh dấu sẵn sàng
          </Button>
        );
        break;
      case OrderStatus.READY:
        buttons.push(
          <Button key="served" type="primary" onClick={() => confirmStatusChange(OrderStatus.SERVED)}>
            Đánh dấu đã phục vụ
          </Button>
        );
        break;
      case OrderStatus.SERVED:
        buttons.push(
          <Button key="complete" type="primary" onClick={() => confirmStatusChange(OrderStatus.COMPLETED)}>
            Hoàn thành đơn
          </Button>
        );
        break;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {buttons}
        <Button icon={<PrinterOutlined />} onClick={handlePrintOrder}>
          In đơn hàng
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết đơn hàng">
        <div className="p-6">
          <Skeleton active />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Chi tiết đơn hàng">
        <div className="p-6">
          <Card>
            <div className="text-center p-4">
              <p className="text-lg">Không tìm thấy thông tin đơn hàng</p>
              <Button type="primary" onClick={() => router.push('/admin/orders')}>
                Quay lại danh sách
              </Button>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Đơn hàng #${order.code || order.id.substring(0, 8)}`}>
      <div className="p-6">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/admin/orders')}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>
        
        <Card>
          <Descriptions title="Thông tin đơn hàng" bordered>
            <Descriptions.Item label="Mã đơn">{order.code || order.id.substring(0, 8)}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{new Date(order.created_at).toLocaleString('vi-VN')}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={orderStatusColors[order.status]}>
                {orderStatusText[order.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Bàn">{order.table ? `Bàn ${order.table.name}` : '-'}</Descriptions.Item>                <Descriptions.Item label="Nhân viên phục vụ">{order.user?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">{order.total_price.toLocaleString('vi-VN')}₫</Descriptions.Item>
          </Descriptions>

          <Divider />

          <h3>Chi tiết các món</h3>
          <Table 
            columns={orderItemColumns}
            dataSource={order.items || []}
            rowKey="id"
            pagination={false}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <strong>Tổng cộng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <strong>{order.total_price.toLocaleString('vi-VN')}₫</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />

          {renderActionButtons()}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default OrderDetailPage;
