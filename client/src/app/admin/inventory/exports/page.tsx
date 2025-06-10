'use client';

import React from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { 
  Table, 
  Button, 
  Card, 
  Typography, 
  Tag, 
  Space, 
  DatePicker, 
  Select, 
  Input, 
  Spin, 
  Alert, 
  Tooltip,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined 
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dayjs, { Dayjs } from 'dayjs';
import { exportService } from '@/app/services/warehouse.service';
import { ExportModel } from '@/app/models/warehouse.model';
import { useState } from 'react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminExportsList: React.FC = () => {
  const router = useRouter();
  const [exports, setExports] = useState<ExportModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  React.useEffect(() => {
    fetchData();
  }, [selectedReason, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Prepare filters
      const filters: any = {};
      if (selectedReason) filters.reason = selectedReason;
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].toDate();
        filters.endDate = dateRange[1].toDate();
      }
      
      // Fetch exports with filters
      const exportsData = await exportService.getAll(filters);
      setExports(exportsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching exports data:', err);
      setError(err.message || 'Không thể tải dữ liệu xuất kho');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };

  const handleReasonChange = (value: string | null) => {
    setSelectedReason(value);
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedReason(null);
    setDateRange(null);
  };

  const filteredExports = exports.filter(item => 
    (item.reference_number || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (item.notes || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const getReasonTag = (reason: string) => {
    switch (reason) {
      case 'usage':
        return <Tag color="blue">Sử dụng</Tag>;
      case 'damaged':
        return <Tag color="volcano">Hư hỏng</Tag>;
      case 'expired':
        return <Tag color="red">Hết hạn</Tag>;
      case 'other':
        return <Tag color="purple">Khác</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: (text: string, record: ExportModel) => (
        <Link href={`/admin/inventory/exports/${record.id}`}>
          <span className="font-medium text-blue-600 hover:text-blue-800">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'export_date',
      key: 'export_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a: ExportModel, b: ExportModel) => dayjs(a.export_date).unix() - dayjs(b.export_date).unix(),
    },
    {
      title: 'Tổng số lượng',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      sorter: (a: ExportModel, b: ExportModel) => a.total_quantity - b.total_quantity,
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => getReasonTag(reason),
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_by',
      key: 'created_by',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ExportModel) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => router.push(`/admin/inventory/exports/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  if (loading && exports.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large">
          <div className="mt-3">Đang tải dữ liệu xuất kho...</div>
        </Spin>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Card>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div>
          <Title level={4}>Quản lý xuất kho</Title>
          <Text type="secondary">Danh sách các phiếu xuất kho</Text>
        </div>
        <div className="mt-2 sm:mt-0">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => router.push('/admin/inventory/exports/create')}
          >
            Tạo phiếu xuất mới
          </Button>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input 
            placeholder="Tìm kiếm theo mã phiếu, ghi chú" 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
        </div>
        
        <div>
          <Select
            placeholder="Lọc theo lý do"
            style={{ width: '100%' }}
            value={selectedReason}
            onChange={handleReasonChange}
            allowClear
          >
            <Option value="usage">Sử dụng</Option>
            <Option value="damaged">Hư hỏng</Option>
            <Option value="expired">Hết hạn</Option>
            <Option value="other">Khác</Option>
          </Select>
        </div>
        
        <div>
          <RangePicker 
            style={{ width: '100%' }} 
            placeholder={['Từ ngày', 'Đến ngày']}
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
      </div>
      
      <div className="mb-4">
        <Button icon={<FilterOutlined />} onClick={resetFilters}>
          Xóa bộ lọc
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredExports} 
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu xuất`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};

export default function AdminExportsPage() {
  return (
    <AdminLayout title="Quản lý xuất kho">
      <div className="p-6">
        <AdminExportsList />
      </div>
    </AdminLayout>
  );
}
