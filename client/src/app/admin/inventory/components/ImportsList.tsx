'use client';

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  DatePicker,
  Input,
  Alert
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { ImportModel } from '@/app/models/warehouse.model';
import { useAdminInventory } from '@/app/contexts/AdminInventoryContext';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ImportsList: React.FC = () => {
  const router = useRouter();
  const { imports, loading, error } = useAdminInventory();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [filteredData, setFilteredData] = useState<ImportModel[]>([]);

  useEffect(() => {
    if (imports) {
      setFilteredData(
        imports.filter(item => {
          // Text search
          const matchesSearch = 
            item.reference_number?.toLowerCase().includes(searchText.toLowerCase()) ||
            item.supplier?.name.toLowerCase().includes(searchText.toLowerCase());

          // Date range filter
          let matchesDate = true;
          if (dateRange) {
            const importDate = moment(item.import_date);
            matchesDate = importDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
          }

          return matchesSearch && matchesDate;
        })
      );
    }
  }, [imports, searchText, dateRange]);

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'reference_number',
      key: 'reference_number',
      width: '15%',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      width: '20%',
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'import_date',
      key: 'import_date',
      width: '15%',
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: '15%',
      render: (amount: number) => amount.toLocaleString('vi-VN') + ' VND',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '15%',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'gold', text: 'Chờ xử lý' },
          completed: { color: 'green', text: 'Hoàn thành' },
          cancelled: { color: 'red', text: 'Đã hủy' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ImportModel) => (
        <Space size="middle">
          <Button
            type="link"
            onClick={() => router.push(`/admin/inventory/imports/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  if (error) {
    return <Alert message={error} type="error" />;
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Title level={4}>Danh sách phiếu nhập kho</Title>
        <Space>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <RangePicker
            onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment])}
            format="DD/MM/YYYY"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/inventory/imports/create')}
          >
            Tạo phiếu nhập
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          total: filteredData.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng số ${total} phiếu nhập`,
        }}
      />
    </Card>
  );
};

export default ImportsList;
