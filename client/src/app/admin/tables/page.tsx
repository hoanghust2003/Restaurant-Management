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

  const handleStatusChange = async (tableId: string, newStatus: string) => {
    setUpdatingStatus(tableId);
    try {
      await tableService.updateStatus(tableId, newStatus as TableStatus);
      message.success('Cập nhật trạng thái bàn thành công!');
      refreshSpecificData('tables');
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái bàn.');
      console.error('Failed to update table status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };  // Handle showing QR code
  const handleShowQrCode = (table: TableModel) => {
    setSelectedTableForQr(table);
    setQrModalVisible(true);
  };

  const handleQrModalClose = () => {
    setQrModalVisible(false);
    // Use a short timeout to allow modal close animation to complete
    setTimeout(() => {
      setSelectedTableForQr(null);
    }, 200);
  };

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
    console.log('Editing table:', table);
    setEditingTable(table);
    
    // Use setTimeout to ensure the form is mounted before setting values
    setTimeout(() => {
      form.setFieldsValue({
        name: table.name,
        capacity: table.capacity,
        status: table.status,
      });
      setIsModalVisible(true);
    }, 0);
  };

  // Handle modal form submission
  const handleModalOk = async () => {
    try {
      // Validate all fields and get values
      const values = await form.validateFields();
      
      if (editingTable) {
        console.log('Updating table:', editingTable.id, values);
        const updatedTable = await tableService.update(editingTable.id, values);
        console.log('Table updated successfully:', updatedTable);
        message.success('Cập nhật bàn thành công!');
      } else {
        console.log('Creating new table with values:', values);
        const newTable = await tableService.create(values);
        console.log('Table created successfully:', newTable);
        message.success('Thêm bàn mới thành công!');
      }
      
      setIsModalVisible(false);
      setEditingTable(null);
      form.resetFields();
      refreshSpecificData('tables');
    } catch (error) {
      console.error('Error saving table:', error);
      // Check for validation error
      if ((error as any).errorFields) {
        return; // Form validation error, no need for error message
      }
      message.error('Có lỗi xảy ra khi lưu thông tin bàn: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      render: (capacity: number) => `${capacity} người`,
    },    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: TableModel) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          style={{ width: 120 }}
          bordered={false}
        >
          {Object.entries(tableStatusText).map(([value, label]) => (
            <Option key={value} value={value}>
              <Tag color={getTableStatusColor(value)} style={{ border: 'none', marginRight: 4 }}>
                {label}
              </Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: TableModel) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            type="link"
          >
            Sửa
          </Button>
          <Button
            icon={<QrcodeOutlined />}
            onClick={() => handleShowQrCode(record)}
            size="small"
            type="link"
          >
            Mã QR
          </Button>
          <Popconfirm
            title="Xóa bàn"
            description="Bạn có chắc chắn muốn xóa bàn này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
            placement="topRight"
            okButtonProps={{ danger: true }}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              type="link"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
        icon={<PlusOutlined />}
      >
        Thêm bàn mới
      </Button>

      <BaseCrudTable<TableModel>
        title="Danh sách bàn"
        service={tableService}
        columns={columns}
        onCreate={() => {
          setEditingTable(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        onEdit={handleEdit}
        fetchDataConfig={{ includeDeleted: false }}
        dataType="tables"
        showActions={false}
      />

      {/* Edit Modal */}
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
