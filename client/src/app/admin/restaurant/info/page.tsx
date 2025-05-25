'use client';

import React from 'react';
import { Card, Spin, message, Alert, Button, Space, Skeleton } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/layouts/AdminLayout';
import RestaurantInfoCard from '@/app/components/restaurant/RestaurantInfoCard';
import { useRestaurantInfo } from '@/app/hooks/useRestaurantInfo';

const RestaurantInfoPage: React.FC = () => {
  const router = useRouter();
  const { restaurant, loading, error, refetch } = useRestaurantInfo();

  const handleBack = () => {
    router.push('/admin');
  };

  const handleEdit = () => {
    if (restaurant) {
      router.push(`/admin/restaurant/edit/${restaurant.id}`);
    }
  };
  
  const handleRefresh = () => {
    refetch();
  };

  if (loading && !restaurant) {
    return (
      <AdminLayout title="Thông tin nhà hàng">
        <div className="p-6">
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Thông tin nhà hàng">
      <div className="p-6">
        {/* Action buttons */}
        <div className="mb-6 flex justify-between items-center">
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="default"
            >
              Quay lại
            </Button>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
          
          {restaurant && (
            <Button 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              type="primary"
              disabled={loading}
            >
              Chỉnh sửa
            </Button>
          )}
        </div>
        
        {/* Error message if any */}
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

        {/* Restaurant Information */}
        {restaurant ? (
          <RestaurantInfoCard restaurant={restaurant} loading={loading && !error} />
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Không có thông tin nhà hàng nào</p>
              <Space>
                <Button onClick={handleRefresh}>
                  Thử lại
                </Button>
                <Button type="primary" onClick={() => router.push('/admin/restaurant/new')}>
                  Tạo mới
                </Button>
              </Space>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default RestaurantInfoPage;
