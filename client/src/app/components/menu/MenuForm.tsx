'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Spin, Checkbox } from 'antd';
import { menuService } from '@/app/services/menu.service';
import { dishService } from '@/app/services/dish.service';
import { CreateMenuDto, MenuModel, UpdateMenuDto } from '@/app/models/menu.model';
import { DishModel } from '@/app/models/dish.model';

const { TextArea } = Input;
const { Option } = Select;

interface MenuFormProps {
  menu?: MenuModel;
  isEdit?: boolean;
  onSuccess?: () => void;
}
const MenuForm: React.FC<MenuFormProps> = ({ menu, isEdit = false, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dishes, setDishes] = useState<DishModel[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);

  // Load dishes for the selection dropdown
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const data = await dishService.getAll();
        setDishes(data);
      } catch (error) {
        console.error('Error loading dishes:', error);
        message.error('Không thể tải danh sách món ăn');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // Initialize form values if editing
  useEffect(() => {
    if (isEdit && menu) {
      form.setFieldsValue({
        name: menu.name,
        description: menu.description,
        is_main: menu.is_main,
      });

      // If menu has dishes, set them in the select
      if (menu.dishes && menu.dishes.length > 0) {
        const dishIds = menu.dishes.map(dish => dish.id);
        setSelectedDishes(dishIds);
        form.setFieldsValue({ dishIds });
      }
    }
  }, [form, isEdit, menu]);
  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      // Ensure dishIds is defined and not empty if dishes are selected
      const formData: CreateMenuDto | UpdateMenuDto = {
        name: values.name,
        description: values.description,
        dishIds: values.dishIds || [],
        is_main: values.is_main || false,
      };
      
      if (isEdit && menu) {
        // Update existing menu
        await menuService.update(menu.id, formData);
        message.success('Cập nhật thực đơn thành công');
      } else {
        // Create new menu
        await menuService.create(formData as CreateMenuDto);
        message.success('Tạo thực đơn mới thành công');
        form.resetFields();
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      message.error('Không thể lưu thực đơn');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ name: '', description: '', dishIds: [], is_main: false }}
    >
      <Form.Item
        name="name"
        label="Tên thực đơn"
        rules={[
          { required: true, message: 'Vui lòng nhập tên thực đơn' },
          { max: 255, message: 'Tên thực đơn tối đa 255 ký tự' }
        ]}
      >
        <Input placeholder="Nhập tên thực đơn" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[
          { required: true, message: 'Vui lòng nhập mô tả thực đơn' }
        ]}
      >
        <TextArea 
          placeholder="Nhập mô tả thực đơn" 
          rows={4} 
          showCount 
          maxLength={1000}
        />
      </Form.Item>

      <Form.Item
        name="dishIds"
        label="Món ăn trong thực đơn"
        rules={[
          { required: true, message: 'Vui lòng chọn ít nhất một món ăn cho thực đơn' }
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Chọn món ăn"
          style={{ width: '100%' }}
          onChange={(values: string[]) => setSelectedDishes(values)}
          optionFilterProp="children"
          showSearch
        >
          {dishes.map(dish => (
            <Option key={dish.id} value={dish.id}>
              {dish.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="is_main"
        valuePropName="checked"
        label="Đặt làm menu chính"
        tooltip="Chỉ một menu được đặt làm menu chính. Khi lưu, menu này sẽ thay thế menu chính hiện tại."
      >
        <Checkbox>Menu chính</Checkbox>
      </Form.Item>

      <Form.Item>
        <div className="flex justify-end space-x-2">
          <Button 
            type="primary"
            htmlType="submit"
            loading={submitting}
          >
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default MenuForm;
