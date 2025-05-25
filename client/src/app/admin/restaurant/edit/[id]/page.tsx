'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Spin, message, Alert, Upload, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { restaurantService } from '@/app/services/restaurant.service';
import { RestaurantModel, UpdateRestaurantDto } from '@/app/models/restaurant.model';
import AdminLayout from '@/app/layouts/AdminLayout';
import ImgCrop from 'antd-img-crop';

const { TextArea } = Input;

const EditRestaurantPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [restaurant, setRestaurant] = useState<RestaurantModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const data = await restaurantService.getById(params.id as string);
        setRestaurant(data);
        
        // Fill form with fetched data
        form.setFieldsValue({
          name: data.name,
          address: data.address,
          phone: data.phone,
          logo_url: data.logo_url,
          cover_image_url: data.cover_image_url,
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Không thể tải thông tin nhà hàng. Vui lòng thử lại sau.');
        message.error('Không thể tải thông tin nhà hàng');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRestaurant();
    }
  }, [params.id, form]);

  const handleBack = () => {
    router.push('/admin/restaurant/info');
  };

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      
      // Handle file uploads first if needed
      let updateData: UpdateRestaurantDto = {
        ...values
      };
      
      // Upload logo if changed
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', logoFile);
        try {
          // Implement file upload service if needed
          // const uploadResult = await fileUploadService.upload(logoFormData);
          // updateData.logo_url = uploadResult.url;
        } catch (error) {
          console.error('Error uploading logo:', error);
        }
      }
      
      // Upload cover image if changed
      if (coverImageFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverImageFile);
        try {
          // Implement file upload service if needed
          // const uploadResult = await fileUploadService.upload(coverFormData);
          // updateData.cover_image_url = uploadResult.url;
        } catch (error) {
          console.error('Error uploading cover image:', error);
        }
      }
      
      // Update restaurant info
      await restaurantService.update(params.id as string, updateData);
      
      message.success('Cập nhật thông tin nhà hàng thành công!');
      
      // Navigate back to info page
      router.push('/admin/restaurant/info');
    } catch (err) {
      console.error('Error updating restaurant:', err);
      message.error('Không thể cập nhật thông tin nhà hàng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chỉnh sửa thông tin nhà hàng">        <div className="p-6 flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-2">Đang tải thông tin nhà hàng...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Chỉnh sửa thông tin nhà hàng">
        <div className="p-6">
          <div className="mb-4">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="default"
            >
              Quay lại
            </Button>
          </div>
          <Alert
            message="Lỗi"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" danger onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            }
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chỉnh sửa thông tin nhà hàng">
      <div className="p-6">
        {/* Header Actions */}
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            type="default"
          >
            Quay lại
          </Button>
        </div>

        {/* Edit Form */}
        <div className="max-w-3xl mx-auto">
          <Card title="Thông tin nhà hàng" className="shadow-md">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={restaurant || {}}
              disabled={saving}
            >
              <Form.Item
                label="Tên nhà hàng"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhà hàng' }]}
              >
                <Input placeholder="Nhập tên nhà hàng" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <TextArea 
                  rows={3}
                  placeholder="Nhập địa chỉ chi tiết"
                />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                label="URL Logo"
                name="logo_url"
              >
                <Input 
                  placeholder="Nhập đường dẫn hình logo" 
                  addonAfter={
                    <ImgCrop rotationSlider>
                      <Upload 
                        maxCount={1}
                        beforeUpload={(file) => {
                          setLogoFile(file);
                          return false;
                        }}
                        showUploadList={false}
                      >
                        <UploadOutlined /> Tải lên
                      </Upload>
                    </ImgCrop>
                  } 
                />
              </Form.Item>

              <Form.Item
                label="URL Ảnh bìa"
                name="cover_image_url"
              >
                <Input 
                  placeholder="Nhập đường dẫn ảnh bìa" 
                  addonAfter={
                    <ImgCrop rotationSlider>
                      <Upload 
                        maxCount={1}
                        beforeUpload={(file) => {
                          setCoverImageFile(file);
                          return false;
                        }}
                        showUploadList={false}
                      >
                        <UploadOutlined /> Tải lên
                      </Upload>
                    </ImgCrop>
                  } 
                />
              </Form.Item>

              {/* Image previews */}
              <div className="mb-6">
                <Space size="large" align="start">
                  {restaurant?.logo_url && (
                    <div className="text-center">
                      <p className="mb-2 text-gray-500">Logo hiện tại</p>
                      <img
                        src={restaurant.logo_url}
                        alt="Restaurant Logo"
                        className="h-24 w-24 object-contain border rounded p-1"
                      />
                    </div>
                  )}
                  
                  {restaurant?.cover_image_url && (
                    <div className="text-center">
                      <p className="mb-2 text-gray-500">Ảnh bìa hiện tại</p>
                      <img
                        src={restaurant.cover_image_url}
                        alt="Restaurant Cover"
                        className="h-24 w-48 object-cover border rounded p-1"
                      />
                    </div>
                  )}
                </Space>
              </div>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  block
                >
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditRestaurantPage;
