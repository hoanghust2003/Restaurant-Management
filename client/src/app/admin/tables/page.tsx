'use client';

import React, { useState } from 'react';
import { Form, Select, message, Modal, Input, InputNumber, Space, Tag, Button } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { TableModel } from '@/app/models/table.model';
import { TableStatus, tableStatusText } from '@/app/utils/enums';
import { tableService } from '@/app/services/table.service';
import AdminLayout from '@/app/layouts/AdminLayout';
import { BaseCrudTable } from '@/app/components/shared/BaseCrudTable';
import { useRefresh } from '@/app/contexts/RefreshContext';
import QrCodeModal from '@/app/components/QrCodeModal';
import { useRouter } from 'next/navigation';

const { Option } = Select;

const TableManagementPage = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState<TableModel | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  
  // Initialize form with default values
  React.useEffect(() => {
    form.setFieldsValue({ status: TableStatus.AVAILABLE });
  }, [form]);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableModel | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { refreshSpecificData } = useRefresh();

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

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingTable(null);
    form.resetFields();
  };

  // Handle status change
  const handleStatusChange = async (tableId: string, newStatus: string) => {
    try {
      setUpdatingStatus(tableId);
      if (!Object.values(TableStatus).includes(newStatus as TableStatus)) {
        throw new Error(`Invalid status value: ${newStatus}`);
      }
      await tableService.updateStatus(tableId, newStatus);
      message.success('Cập nhật trạng thái bàn thành công!');
      refreshSpecificData('tables');
    } catch (error: unknown) {
      console.error('Failed to update table status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái bàn.';
      message.error(errorMessage);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle form submission
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

  // Get status color
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
      <>
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
              sorter: (a: TableModel, b: TableModel) => a.capacity - b.capacity,
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
            },
            {
              title: 'QR Code',
              key: 'qrcode',
              render: (_: unknown, record: TableModel) => (
                <Button
                  type="link"
                  icon={<QrcodeOutlined />}
                  onClick={() => handleShowQrCode(record)}
                >
                  QR
                </Button>
              ),
            }
          ]}
          addButtonText="Thêm bàn mới"
          onCreate={() => {
            console.log('Create button clicked, navigating to /admin/tables/create');
            router.push('/admin/tables/create');
          }}
          onEdit={handleEdit}
          additionalButtons={
            <Space>
              {/* Add additional buttons here if needed */}
            </Space>
          }
          fetchDataConfig={{ includeDeleted: false }}
          dataType="tables"
          showActions={true}
        />

        <Modal
          title={editingTable ? 'Chỉnh sửa bàn' : 'Thêm bàn mới'}
          open={isModalVisible}
          onOk={form.submit}
          onCancel={handleModalCancel}
          confirmLoading={false}
          destroyOnClose={true}
        >
          <Form
            form={form}
            layout="vertical"
            preserve={false}
            onFinish={handleModalOk}
          >
            <Form.Item
              label="Tên bàn"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên bàn!' }]}
            >
              <Input placeholder="Nhập tên bàn" />
            </Form.Item>

            <Form.Item
              label="Sức chứa"
              name="capacity"
              rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
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
              initialValue={TableStatus.AVAILABLE}
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select>
                {Object.entries(tableStatusText).map(([key, text]) => (
                  <Option key={key} value={key}>
                    <Tag color={getTableStatusColor(key)} style={{ border: 'none', marginRight: 4 }}>
                      {text}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <QrCodeModal
          open={qrModalVisible}
          onClose={handleQrModalClose}
          table={selectedTableForQr}
        />
      </>
    </AdminLayout>
  );
};

export default TableManagementPage;
