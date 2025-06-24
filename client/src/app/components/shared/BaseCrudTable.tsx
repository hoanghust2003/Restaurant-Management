import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { BaseService } from '@/app/services/base.service';
import { useRefresh } from '@/app/contexts/RefreshContext';

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
  dataType?: string; // For specific data type refreshing (tables, ingredients, etc.)
  fetchDataConfig?: Record<string, any>; // Additional configuration for fetching data
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
  tableProps = {},
  dataType,
  fetchDataConfig = {}
}: BaseCrudTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const { refreshKey, dataRefreshKeys } = useRefresh();
  // Listen for both global refresh and specific data type refresh
  useEffect(() => {
    fetchData();
  }, [refreshKey, dataType && dataRefreshKeys[dataType]]);
  
  // Ensure we fetch data on initial render
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await service.getAll(fetchDataConfig);
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
    } catch (error: any) {
      console.error('Error deleting:', error);
      // Display the specific error message from the server if available
      message.error(error.message || 'Không thể xóa');
      
      // Check if we need to refresh the token or redirect to login
      if (error.message?.includes('hết hạn')) {
        // Redirect to login after delay so user can see the message
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
      }
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
        )}        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            Modal.confirm({
              title: deleteConfirmTitle,
              content: deleteConfirmDescription,
              okText: 'Xóa',
              cancelText: 'Hủy',
              onOk: async () => {
                try {
                  await handleDelete(record.id);
                } catch (error: any) {
                  // Error already displayed in handleDelete
                }
              }
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
    <Card>      <div className="mb-4 flex justify-between items-center">
        <Space>
          {onCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                console.log('BaseCrudTable: Create button clicked, calling onCreate');
                onCreate();
              }}
            >
              {addButtonText}
            </Button>
          )}
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={loading}
          >
            Làm mới
          </Button>
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
