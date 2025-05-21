'use client';

import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Modal } from 'antd';
import AdminLayout from '@/app/layouts/AdminLayout';
import { TableModel } from '@/app/models/table.model';
import { tableService } from '@/app/services/table.service';
import { TableStatus, tableStatusText } from '@/app/utils/enums';
import { BaseCrudTable } from '@/app/components/shared/BaseCrudTable';
import { BaseCrudForm } from '@/app/components/shared/BaseCrudForm';

const { Option } = Select;

const TableManagementPage = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<TableModel | null>(null);

  const columns = [
    {
      title: 'Tên bàn',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: TableModel, b: TableModel) => a.name.localeCompare(b.name),
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a: TableModel, b: TableModel) => a.capacity - b.capacity,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: TableStatus, record: TableModel) => (
        <Select
          value={status}
          onChange={(value) => tableService.updateStatus(record.id, value)}
          style={{ width: 140 }}
        >
          {Object.entries(tableStatusText).map(([value, label]) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
      ),
      filters: Object.entries(tableStatusText).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value: string, record: TableModel) => record.status === value,
    },
  ];

  const handleSuccess = () => {
    setIsModalVisible(false);
    setEditingTable(null);
  };

  return (
    <AdminLayout title="Quản lý bàn">
      <BaseCrudTable<TableModel>
        service={tableService}
        columns={columns}
        title="Quản lý bàn"
        onCreate={() => setIsModalVisible(true)}
        onEdit={(record) => {
          setEditingTable(record);
          setIsModalVisible(true);
        }}
      />

      <Modal
        title={editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTable(null);
          form.resetFields();
        }}
        footer={null}
      >
        <BaseCrudForm<TableModel>
          form={form}
          service={tableService}
          initialData={editingTable}
          isEdit={!!editingTable}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalVisible(false)}
          successMessage={{
            create: 'Thêm bàn mới thành công',
            update: 'Cập nhật bàn thành công',
          }}
        >
          <Form.Item
            name="name"
            label="Tên bàn"
            rules={[{ required: true, message: 'Vui lòng nhập tên bàn' }]}
          >
            <Input placeholder="Nhập tên bàn" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
          >
            <InputNumber
              min={1}
              max={50}
              placeholder="Nhập sức chứa"
              style={{ width: '100%' }}
            />
          </Form.Item>

          {editingTable && (
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
            >
              <Select>
                {Object.entries(tableStatusText).map(([value, label]) => (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </BaseCrudForm>
      </Modal>
    </AdminLayout>
  );
};

export default TableManagementPage;
