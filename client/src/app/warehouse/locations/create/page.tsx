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
import { locationService } from '@/app/services/warehouse.service';
import WarehouseLayout from '@/app/layouts/WarehouseLayout';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CreateLocationFormData {
  name: string;
  area?: string;
  description?: string;
}

const CreateLocation: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: CreateLocationFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      await locationService.create(values);
      message.success('Tạo vị trí mới thành công');
      router.push('/warehouse/locations');
    } catch (err: any) {
      console.error('Error creating location:', err);
      setError(err.message || 'Không thể tạo vị trí mới');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WarehouseLayout title="Tạo vị trí mới">
      <div className="p-6">
        <Card>
          <div className="mb-4">
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/warehouse/locations')}
              >
                Quay lại
              </Button>
              <Title level={4} className="!mb-0">
                Tạo vị trí mới
              </Title>
            </Space>
          </div>

          {error && (
            <Alert
              message="Lỗi"
              description={error}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="name"
              label="Tên vị trí"
              rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}
            >
              <Input placeholder="Nhập tên vị trí" />
            </Form.Item>

            <Form.Item
              name="area"
              label="Khu vực"
            >
              <Select placeholder="Chọn khu vực">
                <Option value="storage">Kho chính</Option>
                <Option value="freezer">Kho lạnh</Option>
                <Option value="dry">Kho khô</Option>
                <Option value="spice">Kho gia vị</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea
                placeholder="Nhập mô tả cho vị trí"
                rows={4}
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
                <Button onClick={() => router.push('/warehouse/locations')}>
                  Hủy
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
