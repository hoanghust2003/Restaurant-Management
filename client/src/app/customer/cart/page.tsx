'use client';

import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Button, 
  Space, 
  InputNumber, 
  Input,
  Empty,
  Modal,
  Form,
  message,
  Divider,
  Select
} from 'antd';
import { 
  DeleteOutlined, 
  ShoppingOutlined, 
  ArrowLeftOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomerLayout from '@/app/layouts/CustomerLayout';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';
import { formatPrice } from '@/app/utils/format';
import { tableService } from '@/app/services/table.service';
import { orderService } from '@/app/services/order.service';
import { useAuth } from '@/app/contexts/AuthContext';
import { TableModel } from '@/app/models/table.model';
import { TableStatus } from '@/app/utils/enums';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

export default function ShoppingCartPage() {
  const { items, totalPrice, updateItemQuantity, updateItemNote, removeItem, clearCart } = useShoppingCart();
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState<boolean>(false);
  const [tables, setTables] = useState<TableModel[]>([]);
  const [tablesLoading, setTablesLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const router = useRouter();
  
  // Handle quantity change in cart
  const handleQuantityChange = (dishId: string, quantity: number) => {
    updateItemQuantity(dishId, quantity);
  };
  
  // Handle note change in cart
  const handleNoteChange = (dishId: string, note: string) => {
    updateItemNote(dishId, note);
  };
  
  // Handle removing item from cart
  const handleRemoveItem = (dishId: string) => {
    confirm({
      title: 'Xác nhận xóa món ăn',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa món ăn này khỏi giỏ hàng?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        removeItem(dishId);
      },
    });
  };
  
  // Handle showing checkout modal
  const showCheckoutModal = async () => {
    if (!user) {
      message.error('Vui lòng đăng nhập để đặt hàng');
      return;
    }
    
    try {
      setTablesLoading(true);
      const tableData = await tableService.getAll();
      // Only show available tables
      const availableTables = tableData.filter(table => 
        table.status === TableStatus.AVAILABLE || table.status === TableStatus.RESERVED
      );
      setTables(availableTables);
      setCheckoutModalVisible(true);
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Không thể tải danh sách bàn');
    } finally {
      setTablesLoading(false);
    }
  };
  
  // Handle checkout form submission
  const handleCheckout = async (values: any) => {
    if (!user) {
      message.error('Vui lòng đăng nhập để đặt hàng');
      return;
    }
    
    if (items.length === 0) {
      message.error('Giỏ hàng trống');
      return;
    }
    
    try {
      setCheckoutLoading(true);
      
      // Prepare order data
      const orderData = {
        tableId: values.tableId,
        userId: user.id,
        items: items.map(item => ({
          dishId: item.dishId,
          quantity: item.quantity,
          note: item.note
        }))
      };
      
      // Create order through the API
      await orderService.create(orderData);
      
      message.success('Đặt hàng thành công!');
      
      // Clear cart and close modal
      clearCart();
      setCheckoutModalVisible(false);
      
      // Redirect to active orders
      router.push('/customer/orders/active');
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Không thể đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  // Define table columns
  const columns = [
    {
      title: 'Món ăn',
      dataIndex: 'dish',
      key: 'dish',
      render: (dish: any) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <ImageWithFallback
              src={dish.image_url}
              type="dishes"
              alt={dish.name}
              width={64}
              height={64}
              className="object-cover rounded"
            />
          </div>
          <div>
            <div className="font-medium">{dish.name}</div>
            <div className="text-sm text-gray-500">{formatPrice(dish.price)}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number, record: any) => (
        <InputNumber
          min={1}
          max={99}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.dishId, value || 1)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (_: any, record: any) => formatPrice(record.dish.price * record.quantity),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string, record: any) => (
        <Input
          placeholder="Ghi chú cho món này"
          value={note || ''}
          onChange={(e) => handleNoteChange(record.dishId, e.target.value)}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.dishId)}
        />
      ),
    },
  ];
  
  return (
    <CustomerLayout>
      <div className="p-6">
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Space>
              <Link href="/customer/menu">
                <Button icon={<ArrowLeftOutlined />}>Quay lại thực đơn</Button>
              </Link>
              <Title level={2} className="m-0">Giỏ hàng của tôi</Title>
            </Space>
            {items.length > 0 && (
              <Button 
                type="primary"
                danger
                onClick={() => {
                  confirm({
                    title: 'Xác nhận xóa tất cả',
                    icon: <ExclamationCircleOutlined />,
                    content: 'Bạn có chắc chắn muốn xóa tất cả món ăn khỏi giỏ hàng?',
                    okText: 'Xóa tất cả',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk() {
                      clearCart();
                    },
                  });
                }}
              >
                Xóa tất cả
              </Button>
            )}
          </div>
          
          {items.length > 0 ? (
            <>
              <Table
                dataSource={items}
                columns={columns}
                rowKey="dishId"
                pagination={false}
                className="mb-6"
              />
              
              <Divider />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4">
                <div className="mb-4 md:mb-0">
                  <Text className="text-lg">Tổng tiền:</Text>
                  <Title level={3} className="m-0 text-red-500">
                    {formatPrice(totalPrice)}
                  </Title>
                </div>
                
                <Button
                  type="primary"
                  icon={<ShoppingOutlined />}
                  size="large"
                  onClick={showCheckoutModal}
                >
                  Tiến hành đặt hàng
                </Button>
              </div>
            </>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="Giỏ hàng của bạn đang trống"
            >
              <Link href="/customer/menu">
                <Button type="primary">Đi đến thực đơn</Button>
              </Link>
            </Empty>
          )}
        </Card>
        
        <Modal
          title="Xác nhận đặt hàng"
          visible={checkoutModalVisible}
          onCancel={() => setCheckoutModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCheckout}
          >
            <Form.Item
              name="tableId"
              label="Chọn bàn"
              rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
            >
              <Select 
                placeholder="Chọn bàn"
                loading={tablesLoading}
              >
                {tables.map(table => (
                  <Option key={table.id} value={table.id}>
                    {table.name} - {table.capacity} chỗ
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Divider />
            
            <div className="mb-4">
              <Title level={5}>Tổng quan đơn hàng</Title>
              <div className="mb-2">
                <Text>Số lượng món: {items.length}</Text>
              </div>
              <div className="mb-4">
                <Text className="text-lg">Tổng tiền:</Text>
                <Title level={3} className="m-0 text-red-500">
                  {formatPrice(totalPrice)}
                </Title>
              </div>
            </div>
            
            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setCheckoutModalVisible(false)}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={checkoutLoading}
                  disabled={items.length === 0}
                >
                  Xác nhận đặt hàng
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CustomerLayout>
  );
}
