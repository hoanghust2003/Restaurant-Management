'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  message,
  Alert,
  Select
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { warehouseService } from '@/app/services/warehouse.service';
import WarehouseLayout from '@/app/layouts/WarehouseLayout';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CreateLocationFormData {
  name: string;
  area?: string;
  description?: string;
}

const CreateLocation: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm<CreateLocationFormData>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: CreateLocationFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await warehouseService.createLocation(values);
      message.success('Tạo vị trí mới thành công');
      router.push('/warehouse/locations');
    } catch (err: any) {
      console.error('Error creating location:', err);
      setError(err.message || 'Không thể tạo vị trí mới');
      message.error('Có lỗi xảy ra khi tạo vị trí mới');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WarehouseLayout title="Tạo vị trí mới">
      <div className="p-6">
        <Card>
          <div className="mb-6">
            <Title level={4}>Tạo vị trí mới</Title>
            <Paragraph type="secondary">
              Nhập thông tin để tạo vị trí mới trong kho
            </Paragraph>
          </div>

          {error && (
            <Alert 
              message={error} 
              type="error" 
              showIcon 
              className="mb-6" 
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="name"
              label="Tên vị trí"
              rules={[
                { required: true, message: 'Vui lòng nhập tên vị trí' },
                { max: 100, message: 'Tên vị trí không được vượt quá 100 ký tự' }
              ]}
            >
              <Input placeholder="Nhập tên vị trí" />
            </Form.Item>

            <Form.Item
              name="area"
              label="Khu vực"
            >
              <Select placeholder="Chọn khu vực">
                <Option value="storage">Kho chính</Option>
                <Option value="kitchen">Bếp</Option>
                <Option value="bar">Quầy bar</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea 
                rows={4} 
                placeholder="Nhập mô tả về vị trí (không bắt buộc)" 
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                >
                  Tạo vị trí
                </Button>
                <Button 
                  onClick={() => router.push('/warehouse/locations')}
                  icon={<ArrowLeftOutlined />}
                >
                  Quay lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </WarehouseLayout>
  );
};

export default CreateLocation;
