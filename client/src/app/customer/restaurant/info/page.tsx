'use client';

import React from 'react';
import { Card, Button, Skeleton, Alert } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import RestaurantInfoCard from '@/app/components/restaurant/RestaurantInfoCard';
import { useRestaurantInfo } from '@/app/hooks/useRestaurantInfo';

const CustomerRestaurantInfoPage: React.FC = () => {
  const router = useRouter();
  const { restaurant, loading, error, refetch } = useRestaurantInfo();

  const handleBack = () => {
    // Trở về trang menu hoặc trang chính của customer
    router.back();
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header với các nút điều khiển */}
        <div className="mb-6 flex justify-between items-center">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            type="default"
            size="large"
          >
            Quay lại
          </Button>
          
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            type="primary"
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {error && (
          <Alert
            message="Lưu ý"
            description={error}
            type="warning"
            showIcon
            className="mb-4"
            action={
              <Button size="small" onClick={handleRefresh}>
                Thử lại
              </Button>
            }
          />
        )}

        {/* Trạng thái đang tải */}
        {loading && !restaurant && (
          <Card>
            <Skeleton active avatar paragraph={{ rows: 6 }} />
          </Card>
        )}

        {/* Thông tin nhà hàng */}
        {restaurant && (
          <RestaurantInfoCard restaurant={restaurant} loading={loading && !error} />
        )}
        
        {/* Trạng thái không có dữ liệu */}
        {!loading && !restaurant && !error && (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Không có thông tin nhà hàng nào</p>
              <Button onClick={handleRefresh}>
                Thử lại
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerRestaurantInfoPage;
