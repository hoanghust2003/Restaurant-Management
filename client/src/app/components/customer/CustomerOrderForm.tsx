'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Button, message, Modal } from 'antd';
import { CreateCustomerOrderDto } from '@/app/models/customer.model';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { customerService } from '@/app/services/customer.service';

const { Option } = Select;
const { TextArea } = Input;

interface CustomerOrderFormProps {
  tableId?: string;
  onSuccess?: () => void;
}

const CustomerOrderForm: React.FC<CustomerOrderFormProps> = ({ tableId, onSuccess }) => {
  const [form] = Form.useForm();
  const { user } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!user) {
      message.error('Bạn cần đăng nhập để đặt hàng');
      return;
    }

    setSubmitting(true);

    try {
      const orderDto: CreateCustomerOrderDto = {
        tableId: values.tableId,
        userId: user.id,
        notes: values.notes
      };

      await customerService.createOrder(orderDto);
      message.success('Đơn hàng đã được đặt thành công');
      
      // Reset form and call success callback
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating order:', error);
      message.error('Không thể đặt đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Xác nhận đặt hàng"
      open={true}
      footer={null}
      destroyOnHidden
    >
      <Form 
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ tableId: tableId }}
      >
        <Form.Item
          name="tableId"
          label="Số bàn"
          rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
        >
          <Select placeholder="Chọn bàn" disabled={!!tableId}>
            {/* Table options would be mapped here */}
          </Select>
        </Form.Item>

        <Form.Item
          name="notes" 
          label="Ghi chú"
        >
          <TextArea
            rows={4}
            placeholder="Ghi chú thêm cho nhân viên (nếu có)..."
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end space-x-2">
            <Button onClick={() => router.back()}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
            >
              Xác nhận đặt hàng
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerOrderForm;
