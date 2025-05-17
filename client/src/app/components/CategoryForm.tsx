'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { categoryService } from '@/app/services/category.service';
import { CategoryModel } from '@/app/models/category.model';

const { Title } = Typography;
const { TextArea } = Input;

interface CategoryFormProps {
  category?: CategoryModel;
  isEdit?: boolean;
  onSuccess?: (category: CategoryModel) => void;
}

/**
 * Form thêm mới và chỉnh sửa danh mục
 */
const CategoryForm: React.FC<CategoryFormProps> = ({ 
  category, 
  isEdit = false,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Thiết lập dữ liệu ban đầu nếu là form chỉnh sửa
  useEffect(() => {
    if (isEdit && category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description
      });
    }
  }, [category, form, isEdit]);

  // Xử lý submit form
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      let result: CategoryModel;
      
      if (isEdit && category) {
        // Cập nhật danh mục
        result = await categoryService.update(category.id, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        // Tạo danh mục mới
        result = await categoryService.create(values);
        message.success('Tạo danh mục thành công');
        form.resetFields(); // Reset form sau khi tạo thành công
      }
      
      // Gọi callback nếu có
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error submitting category:', error);
      message.error(isEdit ? 'Không thể cập nhật danh mục' : 'Không thể tạo danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <Title level={3} className="mb-6">
        {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      </Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[
            { required: true, message: 'Vui lòng nhập tên danh mục' },
            { max: 100, message: 'Tên danh mục không được quá 100 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea 
            placeholder="Mô tả về danh mục này" 
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>
        
        <Form.Item className="mt-6">
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            block
          >
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CategoryForm;
