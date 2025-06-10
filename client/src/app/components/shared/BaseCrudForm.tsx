import React, { useState } from 'react';
import { Form, Button, message, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { BaseService } from '@/app/services/base.service';

interface BaseCrudFormProps<T> {
  initialData?: T;
  isEdit?: boolean;
  service: BaseService<T>;
  onSuccess?: (data: T) => void;
  onCancel?: () => void;
  form: any; // antd form instance
  children: React.ReactNode;
  successMessage?: {
    create?: string;
    update?: string;
  };
}

export function BaseCrudForm<T>({
  initialData,
  isEdit = false,
  service,
  onSuccess,
  onCancel,
  form,
  children,
  successMessage = {
    create: 'Thêm mới thành công',
    update: 'Cập nhật thành công'
  }
}: BaseCrudFormProps<T>) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      let result;

      if (isEdit && initialData) {
        // @ts-ignore - id exists but TypeScript doesn't know about it
        result = await service.update(initialData.id, values);
        message.success(successMessage.update);
      } else {
        result = await service.create(values);
        message.success(successMessage.create);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      form.resetFields();
    } catch (error: any) {
      console.error('Form submission error:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData as any}
      >
        {children}

        <Form.Item className="mb-0 mt-4 text-right">
          {onCancel && (
            <Button className="mr-2" onClick={onCancel}>
              Hủy
            </Button>
          )}
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
}
