'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Space, 
  Spin, 
  Alert, 
  Switch,
  message 
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { supplierService } from '@/app/services/warehouse.service';
import { SupplierModel, UpdateSupplierDto } from '@/app/models/warehouse.model';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

const EditSupplierPage: React.FC<EditSupplierPageProps> = ({ params }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [supplier, setSupplier] = useState<SupplierModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState<string>('');

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setSupplierId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getById(supplierId);
      setSupplier(data);
      form.setFieldsValue({
        name: data.name,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email,
        address: data.address,
        notes: data.notes,
        active: data.active
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching supplier:', err);
      setError(err.message || 'Không thể tải thông tin nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: UpdateSupplierDto) => {
    try {
      setSaving(true);
      await supplierService.update(supplierId, values);
      message.success('Đã cập nhật nhà cung cấp thành công');
      router.push(`/warehouse/suppliers/${supplierId}`);
    } catch (err: any) {
      console.error('Error updating supplier:', err);
      message.error(`Lỗi: ${err.message || 'Không thể cập nhật nhà cung cấp'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải thông tin nhà cung cấp..." />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error || 'Không tìm thấy nhà cung cấp'}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => router.push('/warehouse/suppliers')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={4}>Chỉnh sửa nhà cung cấp</Title>
            <Text type="secondary">Chỉnh sửa thông tin nhà cung cấp {supplier.name}</Text>
          </div>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.push(`/warehouse/suppliers/${supplier.id}`)}
          >
            Quay lại chi tiết
          </Button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            name: supplier.name,
            contact_person: supplier.contact_person,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            notes: supplier.notes,
            active: supplier.active
          }}
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

          <Form.Item
            name="active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Hoạt động" 
              unCheckedChildren="Không hoạt động"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={saving}
              >
                Lưu thay đổi
              </Button>
              <Button 
                onClick={() => router.push(`/warehouse/suppliers/${supplier.id}`)}
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

export default EditSupplierPage;
