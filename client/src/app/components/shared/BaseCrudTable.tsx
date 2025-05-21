import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BaseService } from '@/app/services/base.service';

interface BaseCrudTableProps<T> {
  service: BaseService<T>;
  columns: any[];
  title: string;
  addButtonText?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  onCreate?: () => void;
  onEdit?: (record: T) => void;
  showActions?: boolean;
  additionalButtons?: React.ReactNode;
  tableProps?: any;
}

export function BaseCrudTable<T>({
  service,
  columns,
  title,
  addButtonText = 'Thêm mới',
  deleteConfirmTitle = 'Xác nhận xóa',
  deleteConfirmDescription = 'Bạn có chắc chắn muốn xóa?',
  onCreate,
  onEdit,
  showActions = true,
  additionalButtons,
  tableProps = {}
}: BaseCrudTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await service.getAll();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await service.delete(id);
      message.success('Xóa thành công');
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      message.error('Không thể xóa');
    }
  };

  const actionColumn = {
    title: 'Thao tác',
    key: 'actions',
    render: (record: any) => (
      <Space>
        {onEdit && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
        )}
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            Modal.confirm({
              title: deleteConfirmTitle,
              content: deleteConfirmDescription,
              okText: 'Xóa',
              cancelText: 'Hủy',
              onOk: () => handleDelete(record.id)
            });
          }}
        >
          Xóa
        </Button>
      </Space>
    )
  };

  const finalColumns = showActions
    ? [...columns, actionColumn]
    : columns;

  return (
    <Card>
      <div className="mb-4 flex justify-between items-center">
        <Space>
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreate}
            >
              {addButtonText}
            </Button>
          )}
          {additionalButtons}
        </Space>
      </div>

      <Table
        columns={finalColumns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
        {...tableProps}
      />
    </Card>
  );
}
