'use client';

import React, { useState } from 'react';
import { Form, Select, message, Modal, Input, InputNumber, Button } from 'antd';
import { TableModel, TableStatus } from '@/app/models/table.model';
import { tableStatusText } from '@/app/utils/enums';
import { tableService } from '@/app/services/table.service';
import AdminLayout from '@/app/layouts/AdminLayout';
import { BaseCrudTable } from '@/app/components/shared/BaseCrudTable';
import { useRefresh } from '@/app/contexts/RefreshContext';

const { Option } = Select;

const TableManagementPage = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<TableModel | null>(null);
  const { refreshSpecificData } = useRefresh();
  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      await tableService.updateStatus(tableId, newStatus as TableStatus);
      message.success('Cập nhật trạng thái bàn thành công!');
      refreshSpecificData('tables');
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái bàn.');
      console.error('Failed to update table status:', error);
    }
  };

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
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 140 }}
        >
          {Object.entries(tableStatusText).map(([value, label]) => (
            <Option key={value} value={value as TableStatus}>
              {label}
            </Option>
          ))}
        </Select>
      ),
      filters: Object.entries(tableStatusText).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value: unknown, record: TableModel) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: TableModel) => (
        <Button
          onClick={() => {
            setEditingTable(record);
            form.setFieldsValue(record);
            setIsModalVisible(true);
          }}
        >
          Chỉnh sửa
        </Button>
      ),
    },
  ];
  const handleModalSuccess = () => {
    setIsModalVisible(false);
    setEditingTable(null);
    form.resetFields();
    refreshSpecificData('tables');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTable(null);
    form.resetFields();
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          if (editingTable) {
            await tableService.update(editingTable.id, values as UpdateTableDto);
            message.success('Cập nhật bàn thành công!');
          } else {
            await tableService.create(values as CreateTableDto);
            message.success('Thêm bàn mới thành công!');
          }
          handleModalSuccess();
        } catch (error) {
          message.error('Có lỗi xảy ra khi lưu bàn.');
          console.error('Error saving table:', error);
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <AdminLayout title="Quản lý bàn">
      <Button
        type="primary"
        onClick={() => {
          setEditingTable(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Thêm bàn mới
      </Button>      <BaseCrudTable<TableModel>
        title="Danh sách bàn"
        service={tableService}
        columns={columns}
        fetchDataConfig={{ includeDeleted: false }}
        dataType="tables"
      />

      <Modal
        title={editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="tableForm">
          <Form.Item
            name="name"
            label="Tên bàn"
            rules={[{ required: true, message: 'Vui lòng nhập tên bàn!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[
              { required: true, message: 'Vui lòng nhập sức chứa!' },
              { type: 'number', min: 1, message: 'Sức chứa phải lớn hơn 0' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default TableManagementPage;

interface CreateTableDto {
  name: string;
  capacity: number;
}

interface UpdateTableDto {
  name?: string;
  capacity?: number;
  status?: TableStatus;
}
