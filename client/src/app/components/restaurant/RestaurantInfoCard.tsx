'use client';

import React from 'react';
import Image from 'next/image';
import { Card, Row, Col, Typography, Space, Avatar, Divider, Skeleton } from 'antd';
import { 
  PhoneOutlined, 
  EnvironmentOutlined, 
  CalendarOutlined, 
  GlobalOutlined 
} from '@ant-design/icons';
import { RestaurantModel } from '@/app/models/restaurant.model';
import { formatDate } from '@/app/utils/format';
import ImageWithFallback from '@/app/components/common/ImageWithFallback';

const { Title, Text, Paragraph } = Typography;

interface RestaurantInfoCardProps {
  restaurant: RestaurantModel;
  loading?: boolean;
}

const RestaurantInfoCard: React.FC<RestaurantInfoCardProps> = ({ 
  restaurant, 
  loading = false 
}) => {
  const formatCreatedDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return formatDate(dateObj);
    } catch (error) {
      return 'Không xác định';
    }
  };

  // Render placeholder if no data is available
  if (!restaurant) {
    return (
      <Card loading={loading} className="w-full shadow-lg">
        <div className="p-4 text-center text-gray-500">
          <GlobalOutlined style={{ fontSize: '2rem' }} />
          <Typography.Title level={3} className="mt-2">
            Không có thông tin nhà hàng
          </Typography.Title>
          <Typography.Text type="secondary">
            Không thể tải thông tin nhà hàng hoặc chưa có thông tin được thiết lập
          </Typography.Text>
        </div>
      </Card>
    );
  }
  return (
    <Card 
      loading={loading}
      className="w-full shadow-lg"      
      cover={
        <div className="h-48 overflow-hidden relative">
          <ImageWithFallback
            alt="Restaurant Cover"
            src={restaurant.cover_image_url || ''}
            fallbackSrc="/placeholder-food.jpg"
            fill
            sizes="100vw"
            priority
            placeholder="blur" 
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            style={{ objectFit: 'cover' }}
          />
        </div>
      }
    >
      <div className="p-4">
        {/* Header with Logo and Basic Info */}        <div className="flex items-start space-x-4 mb-6">
          <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
            <ImageWithFallback
              width={80}
              height={80}
              alt={restaurant.name || "Restaurant Logo"}
              src={restaurant.logo_url || ''}
              fallbackSrc="/default-avatar.png"
              priority
              className="rounded-full"
            />
          </div>

          {/* Restaurant Basic Info */}
          <div className="flex-1">
            <Title level={2} className="mb-2">
              {restaurant.name}
            </Title>
            <Text type="secondary" className="text-base">
              Nhà hàng • ID: {restaurant.id.slice(0, 8)}...
            </Text>
          </div>
        </div>

        <Divider />

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <EnvironmentOutlined className="text-blue-500 text-lg" />
            <div>
              <Text strong>Địa chỉ:</Text>
              <Paragraph className="mb-0 ml-2">
                {restaurant.address}
              </Paragraph>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <PhoneOutlined className="text-green-500 text-lg" />
            <div>
              <Text strong>Số điện thoại:</Text>
              <Text className="ml-2">
                <a href={`tel:${restaurant.phone}`} className="text-blue-600 hover:text-blue-800">
                  {restaurant.phone}
                </a>
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CalendarOutlined className="text-orange-500 text-lg" />
            <div>
              <Text strong>Ngày tạo:</Text>
              <Text className="ml-2">
                {formatCreatedDate(restaurant.created_at)}
              </Text>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(restaurant.logo_url || restaurant.cover_image_url) && (
          <>
            <Divider />
            <div className="space-y-3">
              <Title level={4}>Hình ảnh</Title>
              <Row gutter={[16, 16]}>                {restaurant.logo_url && (
                  <Col xs={12} sm={8} md={6}>
                    <Card 
                      size="small" 
                      title="Logo"
                      cover={
                        <Image 
                          alt="Logo" 
                          src={restaurant.logo_url}
                          width={200}
                          height={100}
                          className="h-24 w-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            console.warn('Failed to load logo thumbnail');
                            (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                          }}
                        />
                      }
                    />
                  </Col>
                )}
                {restaurant.cover_image_url && (
                  <Col xs={12} sm={8} md={6}>
                    <Card 
                      size="small" 
                      title="Ảnh bìa"
                      cover={
                        <Image 
                          alt="Cover" 
                          src={restaurant.cover_image_url}
                          width={200}
                          height={100}
                          className="h-24 w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            console.warn('Failed to load cover thumbnail');
                            (e.target as HTMLImageElement).src = '/placeholder-food.jpg';
                          }}
                        />
                      }
                    />
                  </Col>
                )}
              </Row>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default RestaurantInfoCard;
