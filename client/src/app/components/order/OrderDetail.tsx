'use client';

import React, { useState } from 'react';
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
  Spin
} from 'antd';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  PrinterOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '@/app/contexts/AuthContext';
import { OrderModel, OrderItemModel } from '@/app/models/order.model';
import { orderService } from '@/app/services/order.service';
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
import OrderItemsManagement from './OrderItemsManagement';

const { Title, Text } = Typography;
const { confirm } = Modal;

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
  const canEditOrder = hasRole(['admin', 'waiter']);
  const canCompleteOrder = hasRole(['admin', 'cashier']);
  const canCancelOrder = hasRole(['admin', 'waiter', 'cashier']);
  const isKitchenUser = hasRole(['kitchen']);
  const [localLoading, setLocalLoading] = useState<boolean>(false);

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
          const updatedOrder = await orderService.updateStatus(order.id, status);
          
          if (status === OrderStatus.COMPLETED) {
            await tableService.updateStatus(order.tableId, TableStatus.CLEANING);
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
      
      // Call the API to update order item status
      await orderService.updateOrderItemStatus(order.id, itemId, status);
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Redirect to edit page
  const handleEdit = () => {
    router.push(`/orders/edit/${order.id}`);
  };
  
  // Handle print order
  const handlePrint = () => {
    // Implement print functionality
    message.info('Chức năng in đơn đang được phát triển');
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
      {/* Order Summary Section */}
      <Card className="mb-4">
        <div className="flex justify-between items-start flex-wrap md:flex-nowrap">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <Title level={4} className="mb-0">{order.table?.name || `Bàn #${order.tableId}`}</Title>
              <Tag color={orderStatusColors[order.status]} className="text-lg py-1 px-3">
                {orderStatusText[order.status]}
              </Tag>
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
      </Card>
      
      {/* Order Items Section */}
      <Card title="Danh sách món" className="mb-4">
        {order.items && order.items.length > 0 ? (
          <OrderItemsManagement 
            items={order.items} 
            onStatusChange={handleItemStatusChange} 
            isKitchenView={isKitchenUser}
          />
        ) : (
          <div className="py-4 text-center">
            <Text type="secondary">Không có món nào trong đơn hàng</Text>
          </div>
        )}
        
        <Divider />
        
        <div className="text-right">
          <Space direction="vertical" align="end">
            <Text>Tổng số món: {order.items?.length || 0}</Text>
            <Title level={3}>{formatPrice(calculateTotal())}</Title>
          </Space>
        </div>
      </Card>
      
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
