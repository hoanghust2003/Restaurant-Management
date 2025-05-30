'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Descriptions, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography,
  Divider,
  message,
  Modal,
  Spin,
  Tooltip
  } from 'antd';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '@/app/contexts/AuthContext';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { PaymentModel } from '@/app/models/payment.model';
import { orderService } from '@/app/services/order.service';
import { paymentService } from '@/app/services/payment.service';
import { tableService } from '@/app/services/table.service';
import { 
  OrderStatus,
  OrderItemStatus, 
  orderStatusColors, 
  orderStatusText,
  orderItemStatusColors,
  orderItemStatusText,
  TableStatus
} from '@/app/utils/enums';
import { formatPrice, formatDateTime } from '@/app/utils/format';
import { OrderItemsManagement } from './OrderItemsManagement';
import { VNPayButton } from '../payment/VNPayButton';
import ReceiptPrinter from '../payment/ReceiptPrinter';

const { Title, Text } = Typography;
const { confirm } = Modal;

export const paymentStatusColors: Record<string, string> = {
  'pending': 'gold',
  'processing': 'processing',
  'completed': 'success',
  'failed': 'error',
  'refunded': 'warning'
};

export const paymentStatusText: Record<string, string> = {
  'pending': 'Chờ thanh toán',
  'processing': 'Đang xử lý',
  'completed': 'Đã thanh toán',
  'failed': 'Thất bại',
  'refunded': 'Đã hoàn tiền'
};

interface OrderDetailProps {
  order: OrderModel;
  onStatusChange?: () => void;
  loading?: boolean;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ 
  order, 
  onStatusChange,
  loading = false
}) => {
  const { hasRole, user } = useAuth();
  const router = useRouter();
  const canEditOrder = hasRole(['admin', 'staff']);
  const canCompleteOrder = hasRole(['admin', 'cashier']);
  const canCancelOrder = hasRole(['admin', 'staff']);
  const isKitchenUser = hasRole(['kitchen']);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  const [payment, setPayment] = useState<PaymentModel | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);

  useEffect(() => {
    if (order.id) {
      fetchPaymentStatus();
    }
  }, [order.id]);

  const fetchPaymentStatus = async () => {
    try {
      setPaymentLoading(true);
      const paymentData = await paymentService.getPaymentByOrderId(order.id);
      setPayment(paymentData);
    } catch (error) {
      console.error('Error fetching payment status:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle order status change
  const handleStatusChange = async (status: OrderStatus) => {
    let confirmTitle = '';
    let confirmMessage = '';
    let tableAction = null;
    
    switch (status) {
      case OrderStatus.COMPLETED:
        confirmTitle = 'Xác nhận hoàn thành đơn hàng';
        confirmMessage = 'Bàn sẽ được cập nhật thành trạng thái "Đang dọn dẹp". Xác nhận hoàn thành đơn hàng này?';
        tableAction = TableStatus.CLEANING;
        break;
      case OrderStatus.CANCELED:
        confirmTitle = 'Xác nhận hủy đơn hàng';
        confirmMessage = 'Bạn có chắc chắn muốn hủy đơn hàng này?';
        break;
      default:
        confirmTitle = `Xác nhận đổi trạng thái`;
        confirmMessage = `Bạn có chắc chắn muốn đổi trạng thái đơn hàng thành "${orderStatusText[status]}"?`;
    }
    
    confirm({
      title: confirmTitle,
      content: confirmMessage,
      onOk: async () => {
        try {
          setLocalLoading(true);
          await orderService.updateStatus(order.id, status);

          if (status === OrderStatus.COMPLETED && tableAction) {
            await tableService.updateStatus(order.tableId, tableAction);
          }
          
          message.success(`Đã cập nhật trạng thái đơn hàng thành ${orderStatusText[status]}`);
          
          if (onStatusChange) {
            onStatusChange();
          }
        } catch (error) {
          console.error('Error updating order status:', error);
          message.error('Không thể cập nhật trạng thái đơn hàng');
        } finally {
          setLocalLoading(false);
        }
      }
    });
  };

  // Handle order item status change
  const handleItemStatusChange = async (itemId: string, status: OrderItemStatus) => {
    try {
      setLocalLoading(true);
      await orderService.updateOrderItemStatus(order.id, itemId, status);
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      message.error('Không thể cập nhật trạng thái món');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Redirect to edit page
  const handleEdit = () => {
    router.push(`/orders/edit/${order.id}`);
  };
  
  // Handle print order
  const handlePrint = async () => {
    if (!payment) {
      message.warning('Không thể in hóa đơn khi chưa thanh toán');
      return;
    }

    try {
      // Record the receipt print
      await paymentService.recordReceiptPrint({
        orderId: order.id,
        paymentId: payment.id,
        printedBy: user?.id || 'unknown',
        printedAt: new Date()
      });

      // Trigger print dialog
      document.getElementById('receipt-printer')?.click();
    } catch (error) {
      console.error('Error printing receipt:', error);
      message.error('Có lỗi xảy ra khi in hóa đơn');
    }
  };

  // Calculate total from items if available
  const calculateTotal = () => {
    if (!order.items || order.items.length === 0) return order.total_price;
    
    return order.items.reduce((sum, item) => {
      const price = item.dish?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  // Group items by status for easier management
  const groupItemsByStatus = () => {
    if (!order.items) return {};
    
    return order.items.reduce((acc, item) => {
      acc[item.status] = [...(acc[item.status] || []), item];
      return acc;
    }, {} as Record<OrderItemStatus, OrderItemModel[]>);
  };

  const handleCashPayment = async () => {
    confirm({
      title: 'Xác nhận thanh toán tiền mặt',
      content: `Xác nhận nhận được số tiền ${formatPrice(order.total_price)} từ khách hàng?`,
      icon: <WalletOutlined />,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLocalLoading(true);
          await paymentService.completeCashPayment(order.id);
          message.success('Thanh toán tiền mặt thành công');
          await fetchPaymentStatus();
          if (onStatusChange) {
            onStatusChange();
          }
        } catch (error) {
          console.error('Cash payment error:', error);
          message.error('Có lỗi xảy ra khi thanh toán tiền mặt');
        } finally {
          setLocalLoading(false);
        }
      }
    });
  };

  const handlePaymentSuccess = () => {
    message.success('Thanh toán thành công');
    fetchPaymentStatus();
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    if (error?.response?.data?.message) {
      message.error(error.response.data.message);
    } else {
      message.error('Có lỗi xảy ra trong quá trình thanh toán');
    }
  };

  const renderPaymentStatus = () => {
    if (paymentLoading) {
      return (
        <Tag>
          <Spin size="small" style={{ marginRight: 8 }} />
          Đang kiểm tra thanh toán
        </Tag>
      );
    }

    if (!payment) {
      return (
        <Tag color="warning" icon={<ClockCircleOutlined />}>
          Chưa thanh toán
        </Tag>
      );
    }

    if (payment.error) {
      return (
        <Tooltip title={payment.error}>
          <Tag color={paymentStatusColors[payment.status]} icon={<ExclamationCircleOutlined />}>
            {paymentStatusText[payment.status]}
          </Tag>
        </Tooltip>
      );
    }

    return (
      <Tag color={paymentStatusColors[payment.status]} icon={
        payment.status === 'completed' ? <CheckCircleOutlined /> :
        payment.status === 'processing' ? <ClockCircleOutlined /> :
        <ExclamationCircleOutlined />
      }>
        {paymentStatusText[payment.status]}
      </Tag>
    );
  };

  const renderPaymentActions = () => {
    if (!canCompleteOrder || order.status === OrderStatus.COMPLETED) {
      return null;
    }

    if (payment?.status === 'completed') {
      return (
        <Space>
          <Text type="success">Đã thanh toán</Text>
          <Tooltip title="In hóa đơn">
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
            >
              In hóa đơn
            </Button>
          </Tooltip>
        </Space>
      );
    }

    if (payment?.status === 'processing') {
      return (
        <Space>
          <Tag color="processing">Đang xử lý thanh toán</Tag>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchPaymentStatus}
          >
            Kiểm tra trạng thái
          </Button>
        </Space>
      );
    }

    if (payment?.status === 'failed') {
      return (
        <Space direction="vertical" size="small">
          <Space>
            <Button
              type="default"
              icon={<WalletOutlined />}
              onClick={handleCashPayment}
              loading={localLoading}
            >
              Tiền mặt
            </Button>
            <VNPayButton
              orderId={order.id}
              amount={order.total_price}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Space>
          {payment.error && (
            <Text type="danger" className="text-sm">
              Lỗi thanh toán trước: {payment.error}
            </Text>
          )}
        </Space>
      );
    }

    return (
      <Space>
        <Button
          type="default"
          icon={<WalletOutlined />}
          onClick={handleCashPayment}
          loading={localLoading}
        >
          Tiền mặt
        </Button>
        <VNPayButton
          orderId={order.id}
          amount={order.total_price}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      </Space>
    );
  };

  if (loading || localLoading) {
    return (
      <Card>
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <div>
      {/* Invisible receipt printer */}
      {payment && <ReceiptPrinter order={order} payment={payment} />}

      {/* Order Summary Section */}
      <Card className="mb-4">
        <div className="flex justify-between items-start flex-wrap md:flex-nowrap">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <Title level={4} className="mb-0">{order.table?.name || `Bàn #${order.tableId}`}</Title>
              <Tag color={orderStatusColors[order.status]} className="text-lg py-1 px-3">
                {orderStatusText[order.status]}
              </Tag>
              {renderPaymentStatus()}
            </div>
            
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="Mã đơn">{order.code || order.id.substring(0, 8)}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">{formatDateTime(order.created_at)}</Descriptions.Item>
              <Descriptions.Item label="Người tạo">{order.user?.name || 'N/A'}</Descriptions.Item>
            </Descriptions>
          </div>
          
          <div className="ml-auto">
            <Space>
              {canEditOrder && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELED && (
                <Button 
                  type="default" 
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </Button>
              )}
              
              <Button 
                icon={<PrinterOutlined />} 
                onClick={handlePrint}
              >
                In đơn
              </Button>

              {renderPaymentActions()}
              
              {canCompleteOrder && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELED && (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange(OrderStatus.COMPLETED)}
                >
                  Hoàn thành
                </Button>
              )}
              
              {canCancelOrder && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELED && (
                <Button 
                  danger
                  onClick={() => handleStatusChange(OrderStatus.CANCELED)}
                >
                  Hủy đơn
                </Button>
              )}
            </Space>
          </div>
        </div>

        <Divider />

        <OrderItemsManagement 
          items={order.items || []} 
          onStatusChange={handleItemStatusChange} 
          isKitchenView={isKitchenUser}
        />

        <Divider />

        <div className="flex justify-end">
          <div className="text-right">
            <Title level={4} className="mb-1">Tổng tiền</Title>
            <Title level={2} className="mt-0 text-red-500">
              {formatPrice(order.total_price)}
            </Title>
          </div>
        </div>
      </Card>

      {/* Action Buttons Section */}
      {!isKitchenUser && (
        <Card>
          <Space className="w-full justify-end">
            {canCancelOrder && order.status !== OrderStatus.COMPLETED && (
              <Button 
                danger 
                onClick={() => handleStatusChange(OrderStatus.CANCELED)}
              >
                Hủy đơn
              </Button>
            )}
          </Space>
        </Card>
      )}

      {/* Order Notes Section - Only show if feedback exists */}
      {order.feedback && (
        <Card title="Ghi chú">
          <p>{order.feedback}</p>
        </Card>
      )}
    </div>
  );
};

export default OrderDetail;
