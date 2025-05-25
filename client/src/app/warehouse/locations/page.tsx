'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Typography,
  Input,
  Tag,
  Tooltip,
  Popconfirm,
  message
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { locationService } from '@/app/services/warehouse.service';
import { LocationModel } from '@/app/models/warehouse.model';
import WarehouseLayout from '@/app/layouts/WarehouseLayout';

const { Title } = Typography;
const { Search } = Input;

const LocationsList: React.FC = () => {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getAll();
      setLocations(data);
    } catch (err: any) {
      console.error('Error fetching locations:', err);
      message.error('Không thể tải danh sách vị trí');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await locationService.delete(id);
      message.success('Xóa vị trí thành công');
      fetchLocations();
    } catch (err: any) {
      console.error('Error deleting location:', err);
      message.error('Không thể xóa vị trí');
    }
  };

  const columns = [
    {
      title: 'Tên vị trí',
      dataIndex: 'name',
      key: 'name',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: string, record: LocationModel) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Khu vực',
      dataIndex: 'area',
      key: 'area',
    },
    {
      title: 'Số lượng nguyên liệu',
      dataIndex: 'ingredient_count',
      key: 'ingredient_count',
      render: (count: number) => (
        <Tag color={count > 0 ? 'processing' : 'default'}>
          {count} nguyên liệu
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: LocationModel) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/warehouse/locations/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa vị trí"
              description="Bạn có chắc chắn muốn xóa vị trí này?"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <WarehouseLayout title="Quản lý vị trí kho">
      <div className="p-6">
        <Card>
          <div className="flex flex-wrap justify-between items-center mb-4">
            <Title level={4}>Danh sách vị trí</Title>
            <Space>
              <Search
                placeholder="Tìm kiếm vị trí"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push('/warehouse/locations/create')}
              >
                Thêm vị trí mới
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={locations}
            loading={loading}
            rowKey="id"
            pagination={{
              total: locations.length,
              pageSize: 10,
              showTotal: (total) => `Tổng số ${total} vị trí`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Card>
      </div>
    </WarehouseLayout>
  );
};

export default LocationsList;
