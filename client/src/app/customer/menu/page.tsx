'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Input, 
  Select, 
  Empty, 
  Spin,
  Badge,
  message,
  Tag,
  Space,
  Alert,
  Modal,
  Form,
  Divider
} from 'antd';
import { 
  ShoppingCartOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  MinusOutlined,
  FilterOutlined,
  TableOutlined,
  UsergroupAddOutlined,
  CheckCircleOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { dishService } from '@/app/services/dish.service';
import { categoryService } from '@/app/services/category.service';
import { menuService } from '@/app/services/menu.service';
import { tableService } from '@/app/services/table.service';
import { DishModel } from '@/app/models/dish.model';
import { CategoryModel } from '@/app/models/category.model';
import { MenuModel } from '@/app/models/menu.model';
import { TableModel } from '@/app/models/table.model';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';
import { formatPrice } from '@/app/utils/format';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import { TableStatus } from '@/app/utils/enums';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function CustomerMenuPage() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId');
  const orderSuccess = searchParams.get('orderSuccess');
  const [dishes, setDishes] = useState<DishModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [table, setTable] = useState<TableModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);  
  const [mainMenu, setMainMenu] = useState<MenuModel | null>(null);
  const { addItem, isItemInCart, updateItemQuantity, items, setTableId: setCartTableId, tableId: cartTableId } = useShoppingCart();

  // Table selection modal state
  const [tableSelectionVisible, setTableSelectionVisible] = useState<boolean>(false);
  const [availableTables, setAvailableTables] = useState<TableModel[]>([]);
  const [tablesLoading, setTablesLoading] = useState<boolean>(false);
  const [searchTableText, setSearchTableText] = useState<string>('');

  const [form] = Form.useForm();

  // Check table availability before selection
  const checkTableAvailability = async (tableId: string): Promise<boolean> => {
    try {
      const tableData = await tableService.getById(tableId);
      if (tableData.status !== TableStatus.AVAILABLE) {
        message.error('Bàn này đã được đặt hoặc đang được sử dụng');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking table availability:', error);
      message.error('Không thể kiểm tra trạng thái bàn');
      return false;
    }
  };

  // Load available tables for selection
  const loadTables = async () => {
    try {
      setTablesLoading(true);
      const tableData = await tableService.getAll();
      // Only show actually available tables
      const availableTables = tableData.filter(table => 
        table.status === TableStatus.AVAILABLE
      );
      setAvailableTables(availableTables);
      
      if (!tableId && !cartTableId && availableTables.length === 0) {
        message.warning('Hiện tại không có bàn trống');
      } else if (!tableId && !cartTableId) {
        setTableSelectionVisible(true);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      message.error('Không thể tải danh sách bàn');
    } finally {
      setTablesLoading(false);
    }
  };

  // Handle table selection
  const handleTableSelection = async (values: { tableId: string }) => {
    if (!values.tableId) {
      message.error('Vui lòng chọn bàn');
      return;
    }

    try {
      // Verify table is still available
      const isAvailable = await checkTableAvailability(values.tableId);
      if (!isAvailable) {
        loadTables(); // Refresh table list if table is no longer available
        return;
      }

      setCartTableId(values.tableId);
      setTableSelectionVisible(false);

      // Find and set the selected table
      const selectedTable = availableTables.find(t => t.id === values.tableId);
      if (selectedTable) {
        setTable(selectedTable);
        message.success(`Đã chọn ${selectedTable.name}`);
      }
    } catch (error) {
      console.error('Error selecting table:', error);
      message.error('Không thể chọn bàn');
    }
  };
  
  // Fetch dishes when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If tableId is provided, fetch table information
        if (tableId) {
          try {
            const tableData = await tableService.getById(tableId);
            setTable(tableData);
          } catch (error) {
            console.error('Error fetching table:', error);
            message.error('Không thể tải thông tin bàn');
          }
        }
        
        // Lấy menu chính
        const mainMenuData = await menuService.getMain();
        setMainMenu(mainMenuData);
        // Nếu có menu chính, chỉ lấy các món thuộc menu đó
        let dishesData: DishModel[] = [];
        if (mainMenuData && mainMenuData.dishes) {
          dishesData = mainMenuData.dishes.filter((dish: DishModel) => dish);
        }
        setDishes(dishesData);
        const categoriesData = await categoryService.getAll();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải danh sách món ăn');
      } finally {
        setLoading(false);
      }
    };
      fetchData();
  }, [tableId]);

  // Filter dishes based on search and category
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = searchText 
      ? dish.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchText.toLowerCase()))
      : true;
      
    const matchesCategory = selectedCategory 
      ? dish.category === selectedCategory 
      : true;
      
    return matchesSearch && matchesCategory;
  });

  // Handle adding dish to cart
  const handleAddToCart = (dish: DishModel) => {
    addItem(dish, 1);
  };

  // Handle increasing quantity for dishes already in cart
  const handleIncreaseQuantity = (dish: DishModel) => {
    const cartItem = items.find(item => item.dishId === dish.id);
    if (cartItem) {
      updateItemQuantity(dish.id, cartItem.quantity + 1);
    }
  };

  // Handle decreasing quantity for dishes already in cart
  const handleDecreaseQuantity = (dish: DishModel) => {
    const cartItem = items.find(item => item.dishId === dish.id);
    if (cartItem && cartItem.quantity > 1) {
      updateItemQuantity(dish.id, cartItem.quantity - 1);
    }
  };

  // Get quantity of a dish in the cart
  const getQuantityInCart = (dishId: string): number => {
    const cartItem = items.find(item => item.dishId === dishId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Render dish card
  const renderDishCard = (dish: DishModel) => {
    const inCart = isItemInCart(dish.id);
    const quantityInCart = getQuantityInCart(dish.id);
    
    return (
      <Card 
        key={dish.id} 
        hoverable 
        className="mb-4 overflow-hidden"
        cover={
          <div className="h-48 overflow-hidden">
            <ImageWithFallback
              src={dish.image_url}
              alt={dish.name}
              width={400}
              height={300}
              className="w-full h-full object-cover"
              type="dishes"
              priority={true}
            />
          </div>
        }
      >
        <div className="flex flex-col h-64">
          <div className="flex justify-between items-start mb-2">
            <Title level={5} className="mb-0">
              {dish.name}
            </Title>
          </div>
          
          <Paragraph 
            ellipsis={{ rows: 2 }} 
            className="text-gray-500 mb-2 flex-grow-0"
          >
            {dish.description || 'Không có mô tả'}
          </Paragraph>
          
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-2">
              <Text strong className="text-lg">
                {formatPrice(dish.price)}
              </Text>
              {inCart && (
                <Space>
                  <Button 
                    size="small" 
                    onClick={() => handleDecreaseQuantity(dish)}
                  >
                    -
                  </Button>
                  <Text>{quantityInCart}</Text>
                  <Button 
                    size="small" 
                    onClick={() => handleIncreaseQuantity(dish)}
                  >
                    +
                  </Button>
                </Space>
              )}
            </div>
            
            {!inCart && (
              <Button 
                type="primary" 
                block
                onClick={() => handleAddToCart(dish)}
              >
                Thêm vào giỏ hàng
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Nếu không có menu chính
  if (!mainMenu) {
    return <Empty description="Hiện chưa có menu chính để khách chọn món" />;
  }
  
  return (
    <div className="p-6">
      {/* Table Information Display */}
      {(tableId || cartTableId) && (
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <TableOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              </div>
              <div>
                <div className="text-lg font-medium">
                  {table?.name || 'Bàn đã chọn'}
                </div>
                <div className="text-gray-600">
                  <Space>
                    <span>
                      <UsergroupAddOutlined className="mr-1" />
                      Sức chứa: {table?.capacity || '-'} người
                    </span>
                    <Divider type="vertical" />
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      {table?.status === TableStatus.AVAILABLE ? 'Trống' : 'Đang phục vụ'}
                    </Tag>
                  </Space>
                </div>
              </div>
            </div>
            
            <Space>
              {!tableId && (
                <Button 
                  type="primary"
                  ghost
                  icon={<SwapOutlined />}
                  onClick={loadTables}
                >
                  Đổi bàn
                </Button>
              )}
            </Space>
          </div>
        </Card>
      )}
      
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <Title level={3} className="mb-4 sm:mb-0">
            Thực đơn {(tableId || cartTableId) ? '- Đặt món tại bàn' : ''}
          </Title>
          <Space>
            <Input.Search
              placeholder="Tìm món ăn..."
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select
              allowClear
              placeholder="Chọn danh mục"
              style={{ width: 200 }}
              onChange={(value) => setSelectedCategory(value)}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Space>
        </div>
        
        {!tableId && !cartTableId && (
          <Alert
            message="Bạn chưa chọn bàn"
            description={
              <div>
                Vui lòng chọn bàn để đặt món.
                <Button 
                  type="link" 
                  onClick={() => setTableSelectionVisible(true)}
                >
                  Chọn bàn ngay
                </Button>
              </div>
            }
            type="warning"
            showIcon
            className="mb-4"
          />
        )}
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="flex-col">
            <Spin size="large" />
            <div className="mt-3 text-gray-600">Đang tải món ăn...</div>
          </div>
        </div>
      ) : (
        <>
          {filteredDishes.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredDishes.map(dish => (
                <Col key={dish.id} xs={24} sm={12} md={8} lg={6}>
                  {renderDishCard(dish)}
                </Col>
              ))}
            </Row>
          ) : (
            <Empty 
              description="Không tìm thấy món ăn nào"
              image={Empty.PRESENTED_IMAGE_DEFAULT}
            />
          )}
        </>
      )}
      
      {/* Table Selection Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <TableOutlined className="mr-2" />
            <span>Chọn bàn của bạn</span>
          </div>
        }
        open={tableSelectionVisible}
        onCancel={() => {
          setTableSelectionVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        centered
        width={600}
      >
        <Alert 
          message="Chọn bàn để đặt món" 
          description="Vui lòng chọn bàn trước khi đặt món. Bạn cũng có thể quét mã QR trên bàn để tự động chọn bàn." 
          type="info" 
          showIcon 
          className="mb-4"
        />
        
        <div className="mb-4 flex justify-between items-center">
          <Input.Search
            placeholder="Tìm kiếm bàn..."
            onChange={(e) => setSearchTableText(e.target.value)}
            style={{ width: '60%' }}
            allowClear
          />
          <Text type="secondary">
            {availableTables.length} bàn trống
          </Text>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTableSelection}
          initialValues={{ tableId: '' }}
        >
          {tablesLoading ? (
            <div className="text-center py-6">
              <Spin />
              <div className="mt-2 text-gray-500">Đang tải danh sách bàn...</div>
            </div>
          ) : availableTables.length === 0 ? (
            <Empty 
              description="Không có bàn trống" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto mb-4">
              {availableTables
                .filter(table => 
                  searchTableText ? table.name.toLowerCase().includes(searchTableText.toLowerCase()) : true
                )
                .map(table => (
                  <Card 
                    key={table.id}
                    hoverable
                    size="small"
                    className="cursor-pointer transition-all hover:shadow-md"
                    onClick={() => {
                      form.setFieldsValue({ tableId: table.id });
                      form.submit(); // Use form.submit() instead of direct function call
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lg">{table.name}</div>
                        <div className="text-gray-500">
                          <UsergroupAddOutlined className="mr-1" />
                          Sức chứa: {table.capacity} người
                        </div>
                      </div>
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Trống
                      </Tag>
                    </div>
                  </Card>
                ))
              }
            </div>
          )}
          
          <Form.Item name="tableId" hidden rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
