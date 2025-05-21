'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Spin } from 'antd';
import { SupplierModel } from '@/app/models/supplier.model';
import { supplierService } from '@/app/services/supplier.service';
import { useRouter } from 'next/navigation';

interface SupplierFormProps {
  supplier?: SupplierModel;
  onSuccess?: (supplier: SupplierModel) => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEdit = !!supplier;

  // Nếu là chỉnh sửa, điền dữ liệu từ supplier vào form
  useEffect(() => {
    if (supplier) {
      form.setFieldsValue({
        name: supplier.name,
        contact_name: supplier.contact_name,
        contact_phone: supplier.contact_phone,
        contact_email: supplier.contact_email,
        address: supplier.address,
      });
    }
  }, [supplier, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      let result;
      if (isEdit && supplier) {
        // Cập nhật nhà cung cấp
        result = await supplierService.update(supplier.id, values);
        message.success('Cập nhật nhà cung cấp thành công');
      } else {
        // Tạo nhà cung cấp mới
        result = await supplierService.create(values);
        message.success('Tạo nhà cung cấp thành công');
        form.resetFields(); // Reset form sau khi tạo thành công
      }
      
      // Gọi callback nếu có
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Quay lại trang danh sách
        router.push('/admin/suppliers');
      }
    } catch (error) {
      console.error('Error submitting supplier:', error);
      message.error(isEdit ? 'Không thể cập nhật nhà cung cấp' : 'Không thể tạo nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          className="max-w-2xl mx-auto"
        >
          <Form.Item
            label="Tên nhà cung cấp"
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên nhà cung cấp' },
              { max: 255, message: 'Tên không được vượt quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            label="Tên người liên hệ"
            name="contact_name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên người liên hệ' },
              { max: 255, message: 'Tên không được vượt quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên người liên hệ" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại liên hệ"
            name="contact_phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại liên hệ' },
              { max: 20, message: 'Số điện thoại không được vượt quá 20 ký tự' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại liên hệ" />
          </Form.Item>

          <Form.Item
            label="Email liên hệ"
            name="contact_email"
            rules={[
              { required: true, message: 'Vui lòng nhập email liên hệ' },
              { type: 'email', message: 'Email không hợp lệ' },
              { max: 255, message: 'Email không được vượt quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Nhập email liên hệ" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ' }
            ]}
          >
            <Input.TextArea 
              placeholder="Nhập địa chỉ nhà cung cấp" 
              rows={4} 
            />
          </Form.Item>

          <Form.Item className="flex justify-center mt-6">
            <Button 
              type="default" 
              className="mr-2"
              onClick={() => router.push('/admin/suppliers')}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  );
};

export default SupplierForm;
