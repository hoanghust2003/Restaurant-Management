'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Space, 
  message 
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { supplierService } from '@/app/services/warehouse.service';
import { CreateSupplierDto } from '@/app/models/warehouse.model';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateSupplierPage: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (values: CreateSupplierDto) => {
    try {
      setLoading(true);
      await supplierService.create(values);
      message.success('Đã thêm nhà cung cấp thành công');
      router.push('/warehouse/suppliers');
    } catch (err: any) {
      console.error('Error creating supplier:', err);
      message.error(`Lỗi: ${err.message || 'Không thể thêm nhà cung cấp'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={4}>Thêm nhà cung cấp mới</Title>
            <Text type="secondary">Nhập thông tin để thêm nhà cung cấp mới</Text>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push('/warehouse/suppliers')}
          >
            Quay lại danh sách
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{ active: true }}
        >
          <Form.Item
            name="name"
            label="Tên nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="contact_person"
            label="Người liên hệ"
          >
            <Input placeholder="Nhập tên người liên hệ" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              { 
                pattern: /^[0-9]{10,11}$/, 
                message: 'Vui lòng nhập số điện thoại hợp lệ (10-11 số)', 
                validateTrigger: 'onBlur' 
              }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { 
                type: 'email', 
                message: 'Vui lòng nhập email hợp lệ',
                validateTrigger: 'onBlur'
              }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} placeholder="Nhập ghi chú về nhà cung cấp" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={loading}
              >
                Lưu nhà cung cấp
              </Button>
              <Button 
                onClick={() => router.push('/warehouse/suppliers')}
              >
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateSupplierPage;
