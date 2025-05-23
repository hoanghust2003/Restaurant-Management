'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, InputNumber, Card, message, Typography, Upload } from 'antd';
import { SaveOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { ingredientService } from '@/app/services/ingredient.service';
import { IngredientModel } from '@/app/models/ingredient.model';
import { useRouter } from 'next/navigation';
import ImageWithFallback from '@/app/components/ImageWithFallback';
import { useRefresh } from '@/app/contexts/RefreshContext';

const { Title } = Typography;

// Base URL for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface IngredientFormProps {
  ingredient?: IngredientModel;
  isEdit?: boolean;
  onSuccess?: (ingredient: IngredientModel) => void;
}

/**
 * Form thêm mới và chỉnh sửa nguyên liệu
 */
const IngredientForm: React.FC<IngredientFormProps> = ({ 
  ingredient, 
  isEdit = false,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(ingredient?.image_url || undefined);
  const router = useRouter();
  const { refreshSpecificData } = useRefresh();

  // Thiết lập dữ liệu ban đầu nếu là form chỉnh sửa
  useEffect(() => {
    if (isEdit && ingredient) {
      form.setFieldsValue({
        name: ingredient.name,
        unit: ingredient.unit,
        threshold: ingredient.threshold,
        image_url: ingredient.image_url
      });
      setImageUrl(ingredient.image_url || undefined);
    }
  }, [ingredient, form, isEdit]);

  // Xử lý submit form
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      // Ensure image_url is included in the values
      if (imageUrl && !values.image_url) {
        values.image_url = imageUrl;
      }
      
      let result: IngredientModel;
      
      if (isEdit && ingredient) {
        // Cập nhật nguyên liệu
        result = await ingredientService.update(ingredient.id, values);
        message.success('Cập nhật nguyên liệu thành công');
        // Refresh ingredient data throughout the app
        refreshSpecificData('ingredients');
      } else {
        // Tạo nguyên liệu mới
        result = await ingredientService.create(values);
        message.success('Tạo nguyên liệu thành công');
        form.resetFields(); // Reset form sau khi tạo thành công
        setImageUrl(undefined); // Reset image URL state
        // Refresh ingredient data throughout the app
        refreshSpecificData('ingredients');
      }
      
      // Gọi callback nếu có
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Quay lại trang danh sách
        router.push('/admin/ingredients');
      }
    } catch (error) {
      console.error('Error submitting ingredient:', error);
      message.error(isEdit ? 'Không thể cập nhật nguyên liệu' : 'Không thể tạo nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý upload ảnh
  const uploadProps = {
    name: 'file',
    action: `${API_BASE_URL}/uploads/s3/ingredients`,
    headers: {
      authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    showUploadList: false,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Bạn chỉ có thể tải lên file hình ảnh!');
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Hình ảnh phải nhỏ hơn 5MB!');
      }
      return isImage && isLt5M;
    },
    onChange: (info: any) => {
      if (info.file.status === 'uploading') {
        setImageLoading(true);
        return;
      }
      if (info.file.status === 'done') {
        // Lấy URL từ response
        const imageUrl = info.file.response.url;
        setImageUrl(imageUrl);
        
        // Cập nhật form field
        form.setFieldsValue({ image_url: imageUrl });
        
        setImageLoading(false);
        message.success('Tải ảnh lên thành công');
      } else if (info.file.status === 'error') {
        message.error('Tải ảnh lên thất bại');
        setImageLoading(false);
      }
    },
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <Title level={3} className="mb-6 text-blue-700">
        {isEdit ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Tên nguyên liệu"
          rules={[
            { required: true, message: 'Vui lòng nhập tên nguyên liệu' },
            { max: 255, message: 'Tên nguyên liệu không được quá 255 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tên nguyên liệu" />
        </Form.Item>
        
        <Form.Item
          name="unit"
          label="Đơn vị tính"
          rules={[
            { required: true, message: 'Vui lòng nhập đơn vị tính' },
            { max: 50, message: 'Đơn vị tính không được quá 50 ký tự' }
          ]}
        >
          <Input placeholder="Nhập đơn vị tính (kg, g, l, ml...)" />
        </Form.Item>

        <Form.Item
          name="threshold"
          label="Ngưỡng cảnh báo"
          rules={[
            { required: true, message: 'Vui lòng nhập ngưỡng cảnh báo' },
            { type: 'number', min: 0, message: 'Ngưỡng cảnh báo không được nhỏ hơn 0' }
          ]}
        >
          <InputNumber 
            placeholder="Nhập ngưỡng cảnh báo" 
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="image_url"
          label="Hình ảnh"
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item 
          label="Hình ảnh nguyên liệu" 
          extra="Chọn hình ảnh đại diện cho nguyên liệu (không bắt buộc)"
        >
          <div className="flex flex-col items-center">
            {imageUrl ? (
              <div className="mb-4 relative">
                <ImageWithFallback
                  src={imageUrl}
                  type="ingredients"
                  alt={form.getFieldValue('name') || 'Nguyên liệu'}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
              </div>
            ) : (
              <div className="mb-4 flex justify-center">
                <div className="w-[200px] h-[200px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Chưa có ảnh</span>
                </div>
              </div>
            )}

            <Upload {...uploadProps}>
              <Button icon={imageLoading ? <LoadingOutlined /> : <UploadOutlined />}>
                {imageLoading ? 'Đang tải...' : 'Tải ảnh lên'}
              </Button>
            </Upload>
          </div>
        </Form.Item>
        
        <Form.Item>
          <div className="flex space-x-2">
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />} 
              loading={loading}
            >
              {isEdit ? 'Cập nhật' : 'Tạo nguyên liệu'}
            </Button>
            <Button onClick={() => router.push('/admin/ingredients')}>
              Hủy
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default IngredientForm;
