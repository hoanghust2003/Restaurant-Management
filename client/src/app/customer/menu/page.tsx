'use client';

import React, { useState, useEffect } from 'react';
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
  Space
} from 'antd';
import { 
  ShoppingCartOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  MinusOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { dishService } from '@/app/services/dish.service';
import { categoryService } from '@/app/services/category.service';
import { menuService } from '@/app/services/menu.service';
import { DishModel } from '@/app/models/dish.model';
import { CategoryModel } from '@/app/models/category.model';
import { MenuModel } from '@/app/models/menu.model';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';
import { formatPrice } from '@/app/utils/format';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function CustomerMenuPage() {
  const [dishes, setDishes] = useState<DishModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mainMenu, setMainMenu] = useState<MenuModel | null>(null);
  const { addItem, isItemInCart, updateItemQuantity, items } = useShoppingCart();

  // Fetch dishes when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy menu chính
        const mainMenuData = await menuService.getMain();
        setMainMenu(mainMenuData);
        // Nếu có menu chính, chỉ lấy các món thuộc menu đó
        let dishesData: DishModel[] = [];
        if (mainMenuData && mainMenuData.dishes) {
          dishesData = mainMenuData.dishes.filter((dish: DishModel) => dish.available);
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
  }, []);

  // Filter dishes based on search and category
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = searchText 
      ? dish.name.toLowerCase().includes(searchText.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchText.toLowerCase())
      : true;
      
    const matchesCategory = selectedCategory 
      ? dish.categoryId === selectedCategory 
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
          <div className="h-48 overflow-hidden">            <ImageWithFallback
              src={dish.image_url}
              alt={dish.name}
              width={400}
              height={300}
              className="w-full h-full object-cover"
              type="dishes"
            />
          </div>
        }
      >
        <div className="flex flex-col h-64">
          <div className="flex justify-between items-start mb-2">
            <Title level={5} className="mb-0">
              {dish.name}
            </Title>
            <Tag color={dish.available ? 'success' : 'error'}>
              {dish.available ? 'Còn món' : 'Hết món'}
            </Tag>
          </div>
          
          <Paragraph 
            ellipsis={{ rows: 2 }} 
            className="text-gray-500 mb-2 flex-grow-0"
          >
            {dish.description}
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
                    disabled={!dish.available}
                  >
                    -
                  </Button>
                  <Text>{quantityInCart}</Text>
                  <Button 
                    size="small" 
                    onClick={() => handleIncreaseQuantity(dish)}
                    disabled={!dish.available}
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
                disabled={!dish.available}
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
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <Title level={3} className="mb-4 sm:mb-0">
            Thực đơn
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
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Space>
        </div>
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
    </div>
  );
}
