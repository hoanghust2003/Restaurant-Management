'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Spin, Result, Button, Card, Form, Input, InputNumber, message } from 'antd';
import { tableService } from '@/app/services/table.service';
import { TableStatus } from '@/app/utils/enums';

const CreateTablePage = () => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState(false);

  // Check access permission
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }
  
  // If no access permission
  if (!user || !hasRole(['admin'])) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Xin lỗi, bạn không có quyền truy cập trang này."
        extra={
          <Button type="primary" onClick={() => router.push('/')}>
            Về trang chủ
          </Button>
        }
      />
    );
  }

  const handleSubmit = async (values: { name: string; capacity: number }) => {
    try {
      setSubmitting(true);
      console.log('Creating table with values:', values);
      console.log('Current user:', user);
      console.log('User has admin role:', hasRole(['admin']));
      
      const createData = {
        name: values.name,
        capacity: values.capacity
      };
      console.log('Sending data to API:', createData);
      
      const result = await tableService.create(createData);
      console.log('Table created successfully:', result);
      
      message.success('Thêm bàn mới thành công!');
      router.push('/admin/tables');
    } catch (error: unknown) {
      console.error('Error creating table:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo bàn mới';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Thêm bàn mới">
      <div className="p-6">
        <Card title="Thêm bàn mới" className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: TableStatus.AVAILABLE
            }}
          >
            <Form.Item
              label="Tên bàn"
              name="name"
              rules={[
                { required: true, message: 'Vui lòng nhập tên bàn!' },
                { min: 1, message: 'Tên bàn không được để trống!' }
              ]}
            >
              <Input placeholder="Nhập tên bàn (ví dụ: Bàn 01, Bàn VIP 1)" />
            </Form.Item>

            <Form.Item
              label="Sức chứa"
              name="capacity"
              rules={[
                { required: true, message: 'Vui lòng nhập sức chứa!' },
                { type: 'number', min: 1, message: 'Sức chứa phải lớn hơn 0!' },
                { type: 'number', max: 50, message: 'Sức chứa không được vượt quá 50!' }
              ]}
            >
              <InputNumber
                min={1}
                max={50}
                placeholder="Nhập số người có thể ngồi"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <div className="flex justify-end space-x-2">
              <Button onClick={() => router.push('/admin/tables')}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Tạo bàn
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateTablePage;
