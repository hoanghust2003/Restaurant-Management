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
  Result,
  Modal
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { orderService } from '@/app/services/order.service';
import { OrderModel, UpdateOrderDto, OrderItemModel } from '@/app/models/order.model';
import { DishModel } from '@/app/models/dish.model';
import { dishService } from '@/app/services/dish.service';
import { OrderStatus, OrderItemStatus, orderStatusText } from '@/app/utils/enums';
import { Form, Select, InputNumber, Table, Input, Divider } from 'antd';
import { formatPrice } from '@/app/utils/format';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

interface OrderEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderEditPage({ params }: OrderEditPageProps) {
  const [form] = Form.useForm();
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [dishes, setDishes] = useState<DishModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemModel[]>([]);
  const [removedItems, setRemovedItems] = useState<string[]>([]);
  const [orderId, setOrderId] = useState<string>('');
  const router = useRouter();

  // Load order and dishes data when page loads
  useEffect(() => {
    const initializeData = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };
    initializeData();
  }, [params]);

  // Fetch data when orderId is available
  useEffect(() => {
    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  // Function to fetch all necessary data
  const fetchData = async () => {
    if (!orderId) return; // Don't fetch if orderId is not set yet
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch order details and available dishes in parallel
      const [orderData, dishesData] = await Promise.all([
        orderService.getById(orderId),
        dishService.getAll()
      ]);
      
      setOrder(orderData);
      setDishes(dishesData);
      
      // Set initial order items
      if (orderData.items && orderData.items.length > 0) {
        setOrderItems(orderData.items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải thông tin đơn hàng');
      message.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    router.push(`/orders/${id}`);
  };

  // Handle adding a new item
  const handleAddItem = () => {
    const newItem: OrderItemModel = {
      id: `temp-${Date.now()}`,
      orderId: orderId,
      dishId: '',
      quantity: 1,
      status: OrderItemStatus.WAITING
    };
    
    setOrderItems([...orderItems, newItem]);
  };

  // Handle removing an item
  const handleRemoveItem = (itemId: string) => {
    // If it's an existing item (not a temp item), add to removedItems
    if (!itemId.startsWith('temp-')) {
      setRemovedItems([...removedItems, itemId]);
    }
    
    // Remove from the current order items
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  // Handle dish selection change
  const handleDishChange = (value: string, itemId: string) => {
    const selectedDish = dishes.find(dish => dish.id === value);
    
    setOrderItems(orderItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          dishId: value,
          dish: selectedDish
        };
      }
      return item;
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (value: number, itemId: string) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity: value
        };
      }
      return item;
    }));
  };

  // Handle note change
  const handleNoteChange = (value: string, itemId: string) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          note: value
        };
      }
      return item;
    }));
  };

  // Calculate total price
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const price = item.dish?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Save order changes
  const handleSaveChanges = async () => {
    // Validate items
    const invalidItems = orderItems.filter(item => !item.dishId || item.quantity <= 0);
    
    if (invalidItems.length > 0) {
      message.error('Vui lòng kiểm tra lại thông tin các món hàng');
      return;
    }

    confirm({
      title: 'Xác nhận cập nhật đơn hàng',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn lưu những thay đổi này?',
      onOk: async () => {
        try {
          setSavingLoading(true);
          
          // Prepare update data
          const updateData: UpdateOrderDto = {
            items: orderItems.map(item => ({
              id: item.id.startsWith('temp-') ? undefined : item.id,
              dishId: item.dishId,
              quantity: item.quantity,
              note: item.note
            })),
            removedItems: removedItems
          };
          
          // Call API to update
          await orderService.update(id, updateData);
          
          message.success('Đơn hàng đã được cập nhật thành công');
          router.push(`/orders/${id}`);
        } catch (error) {
          console.error('Error updating order:', error);
          message.error('Không thể cập nhật đơn hàng');
        } finally {
          setSavingLoading(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center min-h-[500px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4">
        <Result
          status="404"
          title="Không tìm thấy đơn hàng"
          subTitle="Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
          extra={
            <Button type="primary" onClick={() => router.push('/orders')}>
              Quay lại danh sách đơn hàng
            </Button>
          }
        />
      </div>
    );
  }

  // If order is completed or canceled, don't allow editing
  if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELED) {
    return (
      <div className="p-4">
        <Breadcrumb items={[
          { title: 'Trang chủ', href: '/' },
          { title: 'Đơn hàng', href: '/orders' },
          { title: `Đơn hàng ${order.code || id.substring(0, 8)}`, href: `/orders/${id}` },
          { title: 'Chỉnh sửa' }
        ]} className="mb-4" />
        
        <Result
          status="warning"
          title="Không thể chỉnh sửa"
          subTitle="Đơn hàng này đã hoàn thành hoặc đã bị hủy nên không thể chỉnh sửa."
          extra={
            <Button type="primary" onClick={() => router.push(`/orders/${id}`)}>
              Quay lại chi tiết đơn hàng
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Breadcrumb items={[
        { title: 'Trang chủ', href: '/' },
        { title: 'Đơn hàng', href: '/orders' },
        { title: `Đơn hàng ${order.code || id.substring(0, 8)}`, href: `/orders/${id}` },
        { title: 'Chỉnh sửa' }
      ]} className="mb-4" />

      <div className="mb-4 flex items-center justify-between">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          Quay lại
        </Button>
        <Title level={3} className="mb-0">
          Chỉnh sửa đơn hàng {order.code || id.substring(0, 8)}
        </Title>
      </div>

      <Card className="mb-4">
        <Form form={form} layout="vertical">
          <div className="mb-4">
            <Title level={5}>Thông tin đơn hàng</Title>
            <Text>Bàn: {order.table?.name || `Bàn #${order.tableId}`}</Text>
            <br />
            <Text>Trạng thái: {orderStatusText[order.status]}</Text>
          </div>
          
          <Title level={5}>Danh sách món</Title>
          
          <div className="order-items">
            {orderItems.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4 mb-4 pb-4 border-b">
                <div className="flex-grow">
                  <Form.Item 
                    label="Món" 
                    rules={[{ required: true, message: 'Vui lòng chọn món' }]}
                  >
                    <Select
                      placeholder="Chọn món"
                      style={{ width: '100%' }}
                      value={item.dishId}
                      onChange={(value) => handleDishChange(value, item.id)}
                    >
                      {dishes.map(dish => (
                        <Option key={dish.id} value={dish.id}>
                          {dish.name} - {formatPrice(dish.price)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
                
                <div style={{ width: 120 }}>
                  <Form.Item label="Số lượng">
                    <InputNumber
                      min={1}
                      value={item.quantity}
                      onChange={(value) => handleQuantityChange(value || 1, item.id)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
                
                <Button 
                  type="text" 
                  danger
                  icon={<MinusCircleOutlined />} 
                  onClick={() => handleRemoveItem(item.id)}
                />
              </div>
            ))}
            
            <Form.Item>
              <Button 
                type="dashed" 
                onClick={handleAddItem} 
                block 
                icon={<PlusOutlined />}
              >
                Thêm món
              </Button>
            </Form.Item>
          </div>
          
          <Divider />
          
          <div className="flex justify-end">
            <div>
              <div className="text-right mb-4">
                <Text className="mr-4">Tổng tiền:</Text>
                <Title level={3} style={{ margin: 0 }}>{formatPrice(calculateTotal())}</Title>
              </div>
              
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSaveChanges}
                loading={savingLoading}
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
