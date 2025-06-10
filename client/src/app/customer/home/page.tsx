'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Statistic,
  Divider,
  List,
  Tag,
  Spin,
  Empty,
  Carousel,
  Badge,
  Space
} from 'antd';
import {
  ShoppingCartOutlined,
  HistoryOutlined,
  BookOutlined,
  FireOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import CustomerLayout from '@/app/layouts/CustomerLayout';
import { orderService } from '@/app/services/order.service';
import { dishService } from '@/app/services/dish.service';
import { menuService } from '@/app/services/menu.service';
import { useShoppingCart } from '@/app/contexts/ShoppingCartContext';
import { OrderModel } from '@/app/models/order.model';
import { DishModel } from '@/app/models/dish.model';
import { MenuModel } from '@/app/models/menu.model';
import { OrderStatus, orderStatusText, orderStatusColors } from '@/app/utils/enums';
import { formatPrice } from '@/app/utils/format';
import ImageWithFallback from '@/app/components/ImageWithFallback';

const { Title, Text, Paragraph } = Typography;

export default function CustomerHomePage() {
  const router = useRouter();
  const { totalItems } = useShoppingCart();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeOrders, setActiveOrders] = useState<OrderModel[]>([]);
  const [popularDishes, setPopularDishes] = useState<DishModel[]>([]);
  const [menus, setMenus] = useState<MenuModel[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get active orders
        // Using the getActive method which is designed for fetching active orders
        // instead of trying to create a custom filter with comma-separated status values
        
        // Fetch data in parallel
        const [ordersData, dishesData, menusData] = await Promise.all([
          orderService.getActive(), // This method already filters for active orders
          dishService.getAll(),
          menuService.getAll()
        ]);
        
        setActiveOrders(ordersData);
        
        // Sort dishes by some popularity metric (here we assume preparation time as a proxy)
        // In a real application, you would have a popularity metric based on orders
        const available = dishesData.filter(dish => dish.available);
        available.sort((a, b) => (a.preparation_time || 0) - (b.preparation_time || 0));
        setPopularDishes(available.slice(0, 6)); // Take top 6
        
        setMenus(menusData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Render menu slides
  const renderMenuSlides = () => {
    if (menus.length === 0) {
      return <div className="p-6 text-center">Không có thực đơn nào</div>;
    }
    
    return menus.map(menu => (
      <div key={menu.id} className="px-2 py-3">
        <Card 
          className="h-64"
          cover={
            <div className="h-32 overflow-hidden">
              <ImageWithFallback
                src={menu.image_url}
                alt={menu.name}
                className="w-full h-full object-cover"
                type="menus"
              />
            </div>
          }
        >
          <Title level={5}>{menu.name}</Title>
          <Paragraph ellipsis={{ rows: 2 }}>{menu.description}</Paragraph>
          <Button 
            type="link" 
            onClick={() => router.push('/customer/menu')}
          >
            Xem chi tiết
          </Button>
        </Card>
      </div>
    ));
  };

  return (
    <CustomerLayout>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spin size="large" tip="Đang tải..." />
          </div>
        ) : (
          <>
            {/* Header Section with Quick Stats */}
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Đơn hàng đang hoạt động"
                    value={activeOrders.length}
                    prefix={<ClockCircleOutlined />}
                  />
                  <Button 
                    type="link" 
                    onClick={() => router.push('/customer/orders/active')}
                    className="p-0 mt-2"
                  >
                    Xem chi tiết
                  </Button>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card>
                  <Statistic
                    title="Món ăn trong giỏ hàng"
                    value={totalItems}
                    prefix={<ShoppingCartOutlined />}
                  />
                  <Button 
                    type="link" 
                    onClick={() => router.push('/customer/cart')}
                    className="p-0 mt-2"
                  >
                    Đến giỏ hàng
                  </Button>
                </Card>
              </Col>
              
              <Col xs={24} md={8} lg={12}>
                <Card className="h-full">
                  <Title level={4}>Chào mừng đến với nhà hàng</Title>
                  <Paragraph>
                    Khám phá thực đơn đa dạng của chúng tôi và đặt món ngay hôm nay. 
                    Chúng tôi cung cấp các món ăn ngon với nguyên liệu tươi ngon nhất.
                  </Paragraph>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<BookOutlined />}
                      onClick={() => router.push('/customer/menu')}
                    >
                      Xem thực đơn
                    </Button>
                    <Button
                      icon={<HistoryOutlined />}
                      onClick={() => router.push('/customer/orders/history')}
                    >
                      Lịch sử đặt hàng
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
            
            {/* Active Orders Section */}
            <Card className="mb-6">
              <Title level={4}>Đơn hàng đang hoạt động</Title>
              <Divider />
              
              {activeOrders.length > 0 ? (
                <List
                  dataSource={activeOrders}
                  renderItem={(order) => (
                    <List.Item
                      key={order.id}
                      actions={[
                        <Button 
                          key="view" 
                          onClick={() => router.push('/customer/orders/active')}
                        >
                          Xem
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center">
                            <Text strong>Đơn #{order.code || order.id.substring(0, 8)}</Text>
                            <Tag className="ml-2" color="blue">{order.table?.name || `Bàn #${order.tableId}`}</Tag>
                          </div>
                        }
                        description={
                          <Space>
                            <Tag color={orderStatusColors[order.status]}>
                              {orderStatusText[order.status]}
                            </Tag>
                            <Badge 
                              count={`${order.items?.length || 0} món`}
                              style={{ backgroundColor: '#52c41a' }}
                            />
                          </Space>
                        }
                      />
                      <div>
                        <Text strong>{formatPrice(order.total_price)}</Text>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="Không có đơn hàng đang hoạt động" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
            
            {/* Popular Dishes Section */}
            <Card className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="m-0">Món ăn phổ biến</Title>
                <Button 
                  type="link"
                  onClick={() => router.push('/customer/menu')}
                >
                  Xem tất cả
                </Button>
              </div>
              <Divider />
              
              <Row gutter={[16, 16]}>
                {popularDishes.map(dish => (
                  <Col xs={24} sm={12} md={8} key={dish.id}>
                    <Card
                      hoverable
                      onClick={() => router.push('/customer/menu')}
                      cover={
                        <div className="h-40 overflow-hidden">
                          <ImageWithFallback
                            src={dish.image_url}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            type="dishes"
                          />
                        </div>
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <Title level={5} className="m-0">{dish.name}</Title>
                          <Text type="secondary">
                            {typeof dish.category === 'string' 
                              ? dish.category 
                              : dish.category?.name}
                          </Text>
                        </div>
                        <Text className="text-red-500 font-bold">{formatPrice(dish.price)}</Text>
                      </div>
                      <div className="mt-2">
                        <Tag color="orange" icon={<FireOutlined />}>Phổ biến</Tag>
                        <Tag color="blue" icon={<ClockCircleOutlined />}>{dish.preparation_time} phút</Tag>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
            
            {/* Menu Showcase Section */}
            <Card>
              <Title level={4}>Thực đơn của nhà hàng</Title>
              <Divider />
              
              <Carousel autoplay>
                {renderMenuSlides()}
              </Carousel>
            </Card>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
