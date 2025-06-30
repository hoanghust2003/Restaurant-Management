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
  ExclamationCircleOutlined,
  TableOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';
import { formatPrice } from '@/app/utils/format';
import { tableService } from '@/app/services/table.service';
import { orderService } from '@/app/services/order.service';
import { customerService } from '@/app/services/customer.service';
import { CreateCustomerOrderDto } from '@/app/models/customer.model';
import { useAuth } from '@/app/contexts/AuthContext';
import { TableModel } from '@/app/models/table.model';
import { TableStatus } from '@/app/utils/enums';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import TableSelector from '@/app/components/customer/TableSelector';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

export default function ShoppingCartPage() {
  const { items, totalPrice, updateItemQuantity, updateItemNote, removeItem, clearCart, tableId: cartTableId, setTableId: setCartTableId } = useShoppingCart();
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState<boolean>(false);
  const [tables, setTables] = useState<TableModel[]>([]);
  const [tablesLoading, setTablesLoading] = useState<boolean>(false);
  const [tableSelectionVisible, setTableSelectionVisible] = useState<boolean>(false);
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
  
  // Handle table selection change
  const handleTableSelectionChange = (selectedTable: TableModel) => {
    setCartTableId(selectedTable.id);
    message.success(`Đã chọn ${selectedTable.name}`);
    setTableSelectionVisible(false);
  };
  
  // Handle showing checkout modal
  const showCheckoutModal = async () => {
    if (!cartTableId) {
      setTableSelectionVisible(true);
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
      
      // If we have a table selected from QR code, set it in the form
      if (cartTableId) {
        form.setFieldsValue({ tableId: cartTableId });
      }
      
      setCheckoutModalVisible(true);
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Không thể tải danh sách bàn');
    } finally {
      setTablesLoading(false);
    }
  };// Handle checkout form submission
  const handleCheckout = async (values: any) => {
    if (items.length === 0) {
      message.error('Giỏ hàng trống');
      return;
    }
    
    try {
      setCheckoutLoading(true);
      
      // Đơn giản hóa payload
      const orderData = {
        tableId: cartTableId || values.tableId,
        items: items.map(item => ({
          dishId: item.dishId,
          quantity: item.quantity,
          note: item.note || undefined
        }))
      };

      // Gửi yêu cầu tạo đơn hàng
      await customerService.createOrder(orderData);
      
      message.success('Đặt hàng thành công!');
      
      // Clear cart and close modal
      clearCart();
      setCheckoutModalVisible(false);
      
      // Chuyển hướng về trang đơn hàng đang hoạt động để khách theo dõi
      setTimeout(() => {
        router.push('/customer/orders/active?orderSuccess=true');
      }, 1000);
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
        title={
          <div className="flex items-center">
            <ShoppingOutlined className="mr-2" />
            <span>Xác nhận đặt hàng</span>
          </div>
        }
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={null}
        destroyOnHidden
        centered
      >
        <Form
          layout="vertical"
          onFinish={handleCheckout}
          form={form}
          initialValues={{ tableId: cartTableId || undefined }}
        >
          {cartTableId ? (
            <div className="mb-6">
              <Card className="bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-full">
                      <TableOutlined style={{ fontSize: '24px', color: '#1890ff' }}/>
                    </div>
                    <div>
                      <div className="text-lg font-medium">
                        {tables.find(t => t.id === cartTableId)?.name || `Bàn đã chọn`}
                      </div>
                      <Text type="secondary">
                        Thông tin bàn đã lấy từ mã QR
                      </Text>
                      <Input type="hidden" name="tableId" value={cartTableId} />
                    </div>
                  </div>
                  <Button 
                    type="primary" 
                    ghost 
                    onClick={() => setTableSelectionVisible(true)}
                  >
                    Đổi bàn
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Form.Item
              name="tableId"
              label="Chọn bàn"
              rules={[{ required: true, message: 'Vui lòng chọn bàn để đặt món' }]}
            >
              <Select 
                placeholder="Chọn bàn để đặt món"
                loading={tablesLoading}
                size="large"
                style={{ width: '100%' }}
              >
                {tables.map(table => (
                  <Option key={table.id} value={table.id}>
                    {table.name} - {table.capacity} chỗ ngồi
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
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
      
      {/* Table Selection Modal */}
      <TableSelector
        visible={tableSelectionVisible}
        onClose={() => setTableSelectionVisible(false)}
        onTableSelect={handleTableSelectionChange}
        currentTableId={cartTableId || undefined}
        title="Chọn bàn để đặt món"
      />
    </div>
  );
}
