'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, InputNumber, Card, message, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { ingredientService } from '@/app/services/ingredient.service';
import { IngredientModel } from '@/app/models/ingredient.model';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

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
  const router = useRouter();

  // Thiết lập dữ liệu ban đầu nếu là form chỉnh sửa
  useEffect(() => {
    if (isEdit && ingredient) {
      form.setFieldsValue({
        name: ingredient.name,
        unit: ingredient.unit,
        threshold: ingredient.threshold
      });
    }
  }, [ingredient, form, isEdit]);

  // Xử lý submit form
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      let result: IngredientModel;
      
      if (isEdit && ingredient) {
        // Cập nhật nguyên liệu
        result = await ingredientService.update(ingredient.id, values);
        message.success('Cập nhật nguyên liệu thành công');
      } else {
        // Tạo nguyên liệu mới
        result = await ingredientService.create(values);
        message.success('Tạo nguyên liệu thành công');
        form.resetFields(); // Reset form sau khi tạo thành công
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
