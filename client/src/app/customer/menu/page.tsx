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
import { customerService } from '@/app/services/customer.service';
import { DishModel } from '@/app/models/dish.model';
import { CategoryModel } from '@/app/models/category.model';
import { MenuModel } from '@/app/models/menu.model';
import { TableModel } from '@/app/models/table.model';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';
import { formatPrice } from '@/app/utils/format';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import { TableStatus } from '@/app/utils/enums';
import TableSelector from '@/app/components/customer/TableSelector';

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

  // Handle table selection
  const handleTableSelection = async (selectedTable: TableModel) => {
    try {
      // Verify table is still available
      const isAvailable = await checkTableAvailability(selectedTable.id);
      if (!isAvailable) {
        message.error('Bàn này không còn trống. Vui lòng chọn bàn khác.');
        setTableSelectionVisible(true); // Open table selector to choose another table
        return;
      }

      setCartTableId(selectedTable.id);
      setTable(selectedTable);
      message.success(`Đã chọn ${selectedTable.name}`);
      setTableSelectionVisible(false);
    } catch (error) {
      console.error('Error selecting table:', error);
      message.error('Không thể chọn bàn');
    }
  };

  // Handle opening table selection modal
  const handleChangeTable = () => {
    setTableSelectionVisible(true);
  };

  // Load available tables for selection
  const loadTables = async () => {
    try {
      const availableTables = await customerService.getAvailableTables();
      
      // If no tables available, show message
      if (availableTables.length === 0) {
        message.warning('Hiện tại không có bàn trống. Vui lòng thử lại sau.');
        return;
      }
      
      // If customer doesn't have a table selected, auto-open table selector
      if (!tableId && !cartTableId) {
        setTableSelectionVisible(true);
      }
    } catch (error) {
      console.error('Error loading available tables:', error);
      message.error('Không thể tải danh sách bàn trống');
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
            setCartTableId(tableId); // Set in cart context
          } catch (error) {
            console.error('Error fetching table:', error);
            message.error('Không thể tải thông tin bàn');
          }
        }
        
        // Initialize with empty states to ensure UI renders
        let mainMenuData: MenuModel | null = null;
        let categoriesData: CategoryModel[] = [];
        let dishesData: DishModel[] = [];
        
        try {
          // Fetch main menu
          console.log('Fetching main menu...');
          mainMenuData = await menuService.getMain();
          console.log('Main menu result:', mainMenuData);
        } catch (error) {
          console.error('Error fetching main menu:', error);
          message.warning('Không thể tải thực đơn chính');
        }
        
        try {
          // Fetch categories
          console.log('Fetching categories...');
          categoriesData = await categoryService.getAll();
          console.log('Categories result:', categoriesData?.length || 0);
        } catch (error) {
          console.error('Error fetching categories:', error);
          message.warning('Không thể tải danh mục món ăn');
        }
        
        // Update states immediately after each fetch
        setMainMenu(mainMenuData);
        setCategories(categoriesData || []);
        
        // Process dishes from main menu
        if (mainMenuData && mainMenuData.dishes && Array.isArray(mainMenuData.dishes)) {
          dishesData = mainMenuData.dishes.filter((dish: DishModel) => 
            dish && dish.available !== false
          );
          console.log('Filtered dishes:', dishesData.length);
        } else {
          console.log('No dishes found in main menu');
        }
        setDishes(dishesData);
        
        // Log final state for debugging
        console.log('Menu data loaded successfully:', {
          mainMenu: !!mainMenuData,
          dishes: dishesData.length,
          categories: categoriesData?.length || 0
        });
        
      } catch (error) {
        console.error('Unexpected error in fetchData:', error);
        message.error('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.');
        
        // Ensure states are set even on error
        setMainMenu(null);
        setDishes([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableId, setCartTableId]);

  // Handle order success message
  useEffect(() => {
    if (orderSuccess === 'true') {
      message.success({
        content: 'Đặt hàng thành công! Nhân viên sẽ mang món đến bàn của bạn sớm.',
        duration: 5,
      });
      
      // Clean up URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('orderSuccess');
      window.history.replaceState({}, '', url.toString());
    }
  }, [orderSuccess]);

  // Check if user should see table selection prompt
  useEffect(() => {
    const checkTableSelection = async () => {
      // Only prompt for table selection if:
      // 1. No table ID from QR code
      // 2. No table in cart context
      // 3. Not currently loading
      // 4. There are dishes available to order
      if (!tableId && !cartTableId && !loading && dishes.length > 0) {
        setTimeout(() => {
          console.log('Auto-opening table selection modal...');
          loadTables();
        }, 500); // Shorter delay to improve UX
      }
    };
    
    checkTableSelection();
  }, [tableId, cartTableId, loading, dishes.length]);

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
    // Check if table is selected
    if (!tableId && !cartTableId) {
      message.warning('Vui lòng chọn bàn trước khi đặt món');
      setTableSelectionVisible(true);
      return;
    }
    
    addItem(dish, 1);
  };

  // Handle increasing quantity for dishes already in cart
  const handleIncreaseQuantity = (dish: DishModel) => {
    // Check if table is selected
    if (!tableId && !cartTableId) {
      message.warning('Vui lòng chọn bàn trước khi đặt món');
      setTableSelectionVisible(true);
      return;
    }
    
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

  // Nếu đang loading
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center p-12">
          <div className="flex-col">
            <Spin size="large" />
            <div className="mt-3 text-gray-600">Đang tải thực đơn...</div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu không có menu chính hoặc không có món nào
  if (!mainMenu) {
    return (
      <div className="p-6">
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <Title level={3} className="mb-4 sm:mb-0">
              Thực đơn
            </Title>
          </div>
          
          {!tableId && !cartTableId && (
            <Alert
              message="Bạn chưa chọn bàn"
              description={
                <div>
                  Vui lòng chọn bàn để đặt món. Bạn có thể quét mã QR trên bàn hoặc chọn bàn thủ công.
                  <div className="mt-2">
                    <Button 
                      type="primary"
                      ghost
                      onClick={loadTables}
                      icon={<TableOutlined />}
                    >
                      Chọn bàn ngay
                    </Button>
                  </div>
                </div>
              }
              type="warning"
              showIcon
              className="mb-4"
            />
          )}
        </Card>
        
        <Empty 
          description="Hiện chưa có thực đơn nào hoặc thực đơn chưa có món ăn" 
          image={Empty.PRESENTED_IMAGE_DEFAULT}
        >
          <Button type="primary" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </Empty>
        
        {/* Table Selection Component */}
        <TableSelector
          visible={tableSelectionVisible}
          onClose={() => setTableSelectionVisible(false)}
          onTableSelect={handleTableSelection}
          currentTableId={cartTableId || tableId || undefined}
        />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      {/* Table Information Display */}
      {(tableId || cartTableId) && table && (
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
              <Button 
                type="primary"
                ghost
                icon={<SwapOutlined />}
                onClick={handleChangeTable}
              >
                Đổi bàn
              </Button>
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
                Vui lòng chọn bàn để đặt món. Bạn có thể quét mã QR trên bàn hoặc chọn bàn thủ công.
                <div className="mt-2">
                  <Button 
                    type="primary"
                    ghost
                    onClick={loadTables}
                    icon={<TableOutlined />}
                  >
                    Chọn bàn ngay
                  </Button>
                </div>
              </div>
            }
            type="warning"
            showIcon
            className="mb-4"
          />
        )}
      </Card>
      
      {/* Check if there are no dishes available */}
      {dishes.length === 0 ? (
        <Empty 
          description="Thực đơn hiện chưa có món ăn nào"
          image={Empty.PRESENTED_IMAGE_DEFAULT}
        >
          <Button type="primary" onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </Empty>
      ) : (
        /* Main content - dishes */
        filteredDishes.length > 0 ? (
          <Row gutter={[16, 16]}>
            {filteredDishes.map(dish => (
              <Col key={dish.id} xs={24} sm={12} md={8} lg={6}>
                {renderDishCard(dish)}
              </Col>
            ))}
          </Row>
        ) : (
          <Empty 
            description="Không tìm thấy món ăn nào phù hợp với tìm kiếm"
            image={Empty.PRESENTED_IMAGE_DEFAULT}
          />
        )
      )}
      
      {/* Table Selection Component */}
      <TableSelector
        visible={tableSelectionVisible}
        onClose={() => setTableSelectionVisible(false)}
        onTableSelect={handleTableSelection}
        currentTableId={cartTableId || tableId || undefined}
      />
    </div>
  );
}
