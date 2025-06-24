'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Result, Button, Card, Form, Input, InputNumber, message, Select } from 'antd';
import { tableService } from '@/app/services/table.service';
import { TableStatus, tableStatusText } from '@/app/utils/enums';
import { TableModel } from '@/app/models/table.model';

const EditTablePage = () => {
  const { user, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tableId = params?.id as string;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState<TableModel | null>(null);

  // Check access permission
  if (authLoading) {
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

  // Load table data
  useEffect(() => {
    if (tableId) {
      loadTable();
    }
  }, [tableId]);

  const loadTable = async () => {
    try {
      setLoading(true);
      const data = await tableService.getById(tableId);
      setTable(data);
      form.setFieldsValue({
        name: data.name,
        capacity: data.capacity,
        status: data.status
      });
    } catch (error) {
      console.error('Error loading table:', error);
      message.error('Không thể tải thông tin bàn');
      router.push('/admin/tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { name: string; capacity: number; status: TableStatus }) => {
    try {
      setSubmitting(true);
      await tableService.update(tableId, values);
      message.success('Cập nhật bàn thành công!');
      router.push('/admin/tables');
    } catch (error: unknown) {
      console.error('Error updating table:', error);
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật bàn';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Chỉnh sửa bàn">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" tip="Đang tải thông tin bàn..." />
        </div>
      </AdminLayout>
    );
  }

  if (!table) {
    return (
      <AdminLayout title="Chỉnh sửa bàn">
        <Result
          status="404"
          title="404"
          subTitle="Không tìm thấy bàn"
          extra={
            <Button type="primary" onClick={() => router.push('/admin/tables')}>
              Về danh sách bàn
            </Button>
          }
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Chỉnh sửa bàn: ${table.name}`}>
      <div className="p-6">
        <Card title={`Chỉnh sửa bàn: ${table.name}`} className="shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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

            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[
                { required: true, message: 'Vui lòng chọn trạng thái!' }
              ]}
            >
              <Select placeholder="Chọn trạng thái bàn">
                {Object.entries(tableStatusText).map(([key, text]) => (
                  <Select.Option key={key} value={key}>
                    {text}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div className="flex justify-end space-x-2">
              <Button onClick={() => router.push('/admin/tables')}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Cập nhật
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EditTablePage;
