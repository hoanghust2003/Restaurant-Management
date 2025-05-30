'use client';

import React, { useState } from 'react';
import { Form, Select, message, Modal, Input, InputNumber, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, QrcodeOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { TableModel } from '@/app/models/table.model';
import { TableStatus, tableStatusText } from '@/app/utils/enums';
import { tableService } from '@/app/services/table.service';
import AdminLayout from '@/app/layouts/AdminLayout';
import { BaseCrudTable } from '@/app/components/shared/BaseCrudTable';
import { useRefresh } from '@/app/contexts/RefreshContext';
import QrCodeModal from '@/app/components/QrCodeModal';

const { Option } = Select;

const TableManagementPage = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<TableModel | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableModel | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { refreshSpecificData } = useRefresh();

  // Show modal for creating/editing
  const showModal = () => {
    form.resetFields();
    form.setFieldsValue({ status: TableStatus.AVAILABLE });
    setIsModalVisible(true);
  };

  // Handle status change
  const handleStatusChange = async (tableId: string, newStatus: string) => {
    setUpdatingStatus(tableId);
    try {
      if (!Object.values(TableStatus).includes(newStatus as TableStatus)) {
        throw new Error(`Invalid status value: ${newStatus}`);
      }
      await tableService.updateStatus(tableId, newStatus);
      message.success('Cập nhật trạng thái bàn thành công!');
      refreshSpecificData('tables');
    } catch (error: any) {
      console.error('Failed to update table status:', error);
      const errorMessage = error.message || 'Lỗi khi cập nhật trạng thái bàn.';
      message.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle showing QR code
  const handleShowQrCode = (table: TableModel) => {
    setSelectedTableForQr(table);
    setQrModalVisible(true);
  };

  // Handle QR modal close
  const handleQrModalClose = () => {
    setQrModalVisible(false);
    setTimeout(() => {
      setSelectedTableForQr(null);
    }, 200);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await tableService.delete(id);
      message.success('Xóa bàn thành công!');
      refreshSpecificData('tables');
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa bàn.');
      console.error('Error deleting table:', error);
    }
  };

  // Handle editing table
  const handleEdit = (table: TableModel) => {
    setEditingTable(table);
    form.setFieldsValue({
      name: table.name,
      capacity: table.capacity,
      status: table.status,
    });
    setIsModalVisible(true);
  };

  // Handle modal form submission 
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingTable) {
        await tableService.update(editingTable.id, values);
        message.success('Cập nhật bàn thành công!');
      } else {
        await tableService.create(values);
        message.success('Thêm bàn mới thành công!');
      }
      
      setIsModalVisible(false);
      setEditingTable(null);
      form.resetFields();
      refreshSpecificData('tables');
    } catch (error) {
      console.error('Error saving table:', error);
      message.error('Có lỗi xảy ra khi lưu thông tin bàn');
    }
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTable(null);
    form.resetFields();
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return 'success';
      case TableStatus.OCCUPIED:
        return 'error';
      case TableStatus.RESERVED:
        return 'warning';
      case TableStatus.CLEANING:
        return 'processing';
      default:
        return 'default';
    }
  };

  return (
    <AdminLayout>
      <BaseCrudTable
        service={tableService}
        title="Quản lý bàn"
        columns={[
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
            render: (capacity: number) => `${capacity} người`,
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: TableModel) => (
              <Select
                value={status}
                onChange={(newStatus: string) => handleStatusChange(record.id, newStatus)} 
                style={{ width: 120 }}
                disabled={updatingStatus === record.id}
              >
                {Object.values(TableStatus).map((status) => (
                  <Option key={status} value={status}>
                    <Tag color={getTableStatusColor(status)} style={{ border: 'none', marginRight: 4 }}>
                      {tableStatusText[status]}
                    </Tag>
                  </Option>
                ))}
              </Select>
            ),
          }
        ]}
        addButtonText="Thêm bàn mới"
        onCreate={() => {
          form.resetFields();
          setEditingTable(null);
          setIsModalVisible(true);
        }}
        onEdit={handleEdit}
        fetchDataConfig={{ includeDeleted: false }}
        dataType="tables"
        showActions={true}
      />

      {/* Edit/Create Modal */}
      <Modal
        title={editingTable ? "Sửa thông tin bàn" : "Thêm bàn mới"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingTable ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={editingTable || { status: TableStatus.AVAILABLE }}
        >
          <Form.Item
            name="name"
            label="Tên bàn"
            rules={[{ required: true, message: 'Vui lòng nhập tên bàn!' }]}
          >
            <Input placeholder="Nhập tên bàn" />
          </Form.Item>
          
          <Form.Item
            name="capacity"
            label="Sức chứa"
            rules={[
              { required: true, message: 'Vui lòng nhập sức chứa!' },
              { type: 'number', min: 1, message: 'Sức chứa phải lớn hơn 0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="Nhập số chỗ ngồi" 
              min={1} 
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              {Object.entries(tableStatusText).map(([value, label]) => (
                <Option key={value} value={value}>{label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <QrCodeModal
        open={qrModalVisible}
        table={selectedTableForQr}
        onClose={handleQrModalClose}
      />
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
