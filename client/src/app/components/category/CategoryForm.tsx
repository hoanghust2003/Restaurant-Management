'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { CategoryModel, CreateCategoryDto, UpdateCategoryDto } from '@/app/models/category.model';
import { categoryService } from '@/app/services/category.service';

const { TextArea } = Input;

// Cập nhật interface để hỗ trợ cả hai cách gọi
interface CategoryFormProps {
  // Hỗ trợ props gốc
  initialData?: CategoryModel;
  isEditing?: boolean;
  
  // Hỗ trợ props tương thích với component CategoryForm chính
  category?: CategoryModel;
  isEdit?: boolean;
  onSuccess?: (category: CategoryModel) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ 
  // Sử dụng cả hai bộ props, ưu tiên bộ mới hơn
  initialData, isEditing = false,
  category, isEdit = false,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  
  // Chọn dữ liệu từ props
  const categoryData = category || initialData;
  const isEditMode = isEdit || isEditing;
  
  // Khởi tạo form khi có dữ liệu ban đầu
  useEffect(() => {
    if (categoryData) {
      form.setFieldsValue({
        name: categoryData.name,
        description: categoryData.description || '',
      });
    }
  }, [categoryData, form]);

  // Xử lý submit form  
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = {
        name: values.name,
        description: values.description || '',
      };

      let result: CategoryModel;
      if (isEditMode && categoryData) {
        const id = category?.id || initialData?.id || '';
        result = await categoryService.update(id, formData);
        message.success('Cập nhật danh mục thành công');
      } else {
        result = await categoryService.create(formData);
        message.success('Thêm danh mục thành công');
        form.resetFields();
      }
      
      // Gọi callback hoặc chuyển hướng
      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push('/admin/categories');
      }
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error);
      message.error('Không thể lưu danh mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea rows={4} placeholder="Nhập mô tả cho danh mục" />
        </Form.Item>

        <Form.Item>
          <div className="flex space-x-2">
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </Button>
            <Button onClick={() => router.push('/admin/categories')}>
              Hủy
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default CategoryForm;
