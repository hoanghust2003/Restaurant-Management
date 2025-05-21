'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  InputNumber, 
  Button, 
  Card, 
  Table, 
  Space, 
  Typography,
  Input,
  message,
  Divider
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { tableService } from '@/app/services/table.service';
import { dishService } from '@/app/services/dish.service';
import { orderService } from '@/app/services/order.service';
import { TableModel } from '@/app/models/table.model';
import { DishModel } from '@/app/models/dish.model';
import { CreateOrderDto } from '@/app/models/order.model';
import { TableStatus, OrderStatus } from '@/app/utils/enums';
import { formatPrice } from '@/app/utils/format';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface OrderFormProps {
  tableId?: string;
  onSuccess?: () => void;
}

interface OrderItem {
  key: string;
  dishId: string;
  dish?: DishModel;
  quantity: number;
  note?: string;
  price: number;
}

const OrderForm: React.FC<OrderFormProps> = ({ tableId, onSuccess }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const router = useRouter();
  
  const [tables, setTables] = useState<TableModel[]>([]);
  const [dishes, setDishes] = useState<DishModel[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | undefined>(tableId);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch tables and dishes on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch available tables
        const tablesData = await tableService.getAll();
        const availableTables = tablesData.filter(
          table => table.status === TableStatus.AVAILABLE || table.status === TableStatus.OCCUPIED
        );
        setTables(availableTables);
        
        // Fetch dishes
        const dishesData = await dishService.getAll();
        setDishes(dishesData);
        
        // If tableId is provided, set it as the selected table
        if (tableId) {
          setSelectedTable(tableId);
          form.setFieldsValue({ tableId });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu bàn hoặc món ăn');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tableId, form]);

  // Handle adding a dish to the order
  const handleAddDish = () => {
    const formValues = form.getFieldsValue();
    const dish = dishes.find(d => d.id === formValues.dishId);
    
    if (!dish) {
      message.error('Vui lòng chọn món ăn');
      return;
    }
    
    if (!formValues.quantity || formValues.quantity < 1) {
      message.error('Số lượng phải lớn hơn 0');
      return;
    }
    
    const newItem: OrderItem = {
      key: `${Date.now()}`, // temporary key
      dishId: dish.id,
      dish: dish,
      quantity: formValues.quantity,
      note: formValues.note,
      price: dish.price * formValues.quantity,
    };
    
    setOrderItems([...orderItems, newItem]);
    
    // Reset the form fields for dish selection
    form.setFieldsValue({
      dishId: undefined,
      quantity: 1,
      note: undefined,
    });
  };

  // Handle removing a dish from the order
  const handleRemoveDish = (key: string) => {
    setOrderItems(orderItems.filter(item => item.key !== key));
  };

  // Calculate total price of the order
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.price, 0);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một món ăn vào đơn hàng');
      return;
    }
    
    if (!selectedTable) {
      message.error('Vui lòng chọn bàn');
      return;
    }
    
    if (!user) {
      message.error('Bạn cần đăng nhập để tạo đơn hàng');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create the order DTO
      const orderDto: CreateOrderDto = {
        tableId: selectedTable,
        userId: user.id,
        items: orderItems.map(item => ({
          dishId: item.dishId,
          quantity: item.quantity,
          note: item.note,
        })),
      };
      
      // Submit the order
      await orderService.create(orderDto);
      
      // Update table status if needed
      const selectedTableData = tables.find(t => t.id === selectedTable);
      if (selectedTableData && selectedTableData.status === TableStatus.AVAILABLE) {
        await tableService.updateStatus(selectedTable, TableStatus.OCCUPIED);
      }
      
      message.success('Đơn hàng đã được tạo thành công');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Reset form and order items
        form.resetFields();
        setOrderItems([]);
        setSelectedTable(undefined);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Không thể tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Tên món',
      dataIndex: ['dish', 'name'],
      key: 'name',
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
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: OrderItem) => (
        <Button
          type="text"
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => handleRemoveDish(record.key)}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card loading={loading} title="Tạo đơn hàng mới" className="shadow">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ quantity: 1 }}
        >
          <Form.Item
            name="tableId"
            label="Bàn"
            rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
          >
            <Select
              placeholder="Chọn bàn"
              disabled={!!tableId}
              onChange={(value) => setSelectedTable(value)}
            >
              {tables.map(table => (
                <Option key={table.id} value={table.id}>
                  {table.name} {table.status === TableStatus.OCCUPIED && '(Đang sử dụng)'}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider>Thêm món ăn</Divider>
          
          <div className="flex flex-wrap gap-4">
            <Form.Item
              name="dishId"
              label="Món ăn"
              className="flex-grow"
            >
              <Select
                placeholder="Chọn món ăn"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {dishes.map(dish => (
                  <Option key={dish.id} value={dish.id}>{dish.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="quantity"
              label="Số lượng"
              className="w-24"
            >
              <InputNumber min={1} />
            </Form.Item>
          </div>
          
          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea rows={2} placeholder="Ghi chú cho món ăn (tùy chọn)" />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="dashed" 
              onClick={handleAddDish}
              icon={<PlusOutlined />}
            >
              Thêm món ăn
            </Button>
          </Form.Item>
          
          <Divider>Món đã chọn</Divider>
          
          <Table
            dataSource={orderItems}
            columns={columns}
            pagination={false}
            rowKey="key"
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Tổng cộng</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong>{formatPrice(calculateTotal())}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )}
          />
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={orderItems.length === 0}
            >
              Tạo đơn hàng
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default OrderForm;
