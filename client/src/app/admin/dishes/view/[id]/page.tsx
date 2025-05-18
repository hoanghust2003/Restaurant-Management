'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Spin, message, Alert, Button, Space } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { dishService } from '@/app/services/dish.service';
import { DishModel } from '@/app/models/dish.model';
import RoleBasedLayout from '@/app/components/RoleBasedLayout';
import DishDetail from '@/app/components/dish/DishDetail';
import { Modal } from 'antd';

const { confirm } = Modal;

const ViewDishPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [dish, setDish] = useState<DishModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        setLoading(true);
        const dishData = await dishService.getById(params.id);
        setDish(dishData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dish:', err);
        setError('Không thể tải thông tin món ăn. Vui lòng thử lại sau.');
        message.error('Không thể tải thông tin món ăn');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchDish();
    }
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/admin/dishes/edit/${params.id}`);
  };

  const handleDelete = () => {
    if (!dish) return;

    confirm({
      title: 'Bạn có chắc chắn muốn xóa món ăn này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Món ăn sẽ được chuyển vào thùng rác và có thể khôi phục sau.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await dishService.delete(dish.id);
          message.success('Xóa món ăn thành công');
          router.push('/admin/dishes');
        } catch (error) {
          console.error('Error deleting dish:', error);
          message.error('Không thể xóa món ăn');
        }
      },
    });
  };

  return (
    <RoleBasedLayout allowedRoles={['admin', 'manager']}>
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={() => router.back()}>
                Quay lại
              </Button>
            }
          />
        ) : dish ? (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/admin/dishes')}
              >
                Quay lại danh sách
              </Button>
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Xóa
                </Button>
              </Space>
            </div>
            
            <DishDetail dish={dish} />
          </div>
        ) : (
          <Alert
            message="Không tìm thấy món ăn"
            description="Không tìm thấy thông tin món ăn với ID đã cung cấp."
            type="warning"
            showIcon
            action={
              <Button 
                size="small" 
                onClick={() => router.push('/admin/dishes')}
              >
                Quay lại
              </Button>
            }
          />
        )}
      </div>
    </RoleBasedLayout>
  );
};

export default ViewDishPage;
