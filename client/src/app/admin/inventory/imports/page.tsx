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
  Badge,
  message
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import moment from 'moment';
import { importService, supplierService } from '@/app/services/warehouse.service';
import { ImportModel, SupplierModel } from '@/app/models/warehouse.model';
import { useState } from 'react';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminImportsList: React.FC = () => {
  const router = useRouter();
  const [imports, setImports] = useState<ImportModel[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null] | null>(null);

  React.useEffect(() => {
    fetchData();
  }, [selectedSupplier, selectedStatus, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch suppliers for filter dropdown
      const suppliersData = await supplierService.getAll();
      setSuppliers(suppliersData);
      
      // Prepare filters
      const filters: any = {};
      if (selectedSupplier) filters.supplier_id = selectedSupplier;
      if (selectedStatus) filters.status = selectedStatus;
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].toDate();
        filters.endDate = dateRange[1].toDate();
      }
      
      // Fetch imports with filters
      const importsData = await importService.getAll(filters);
      setImports(importsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching imports data:', err);
      setError(err.message || 'Không thể tải dữ liệu nhập kho');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  const handleStatusChange = (value: string | null) => {
    setSelectedStatus(value);
  };

  const handleSupplierChange = (value: string | null) => {
    setSelectedSupplier(value);
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedSupplier(null);
    setSelectedStatus(null);
    setDateRange(null);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await importService.updateStatus(id, status);
      message.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (err: any) {
      message.error(`Lỗi: ${err.message || 'Không thể cập nhật trạng thái'}`);
    }
  };

  const filteredImports = imports.filter(item => 
    item.reference_number.toLowerCase().includes(searchText.toLowerCase()) ||
    (item.supplier?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (item.notes || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'reference_number',
      key: 'reference_number',
      render: (text: string, record: ImportModel) => (
        <Link href={`/admin/inventory/imports/${record.id}`}>
          <span className="font-medium text-blue-600 hover:text-blue-800">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'import_date',
      key: 'import_date',
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
      sorter: (a: ImportModel, b: ImportModel) => moment(a.import_date).unix() - moment(b.import_date).unix(),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier: SupplierModel | undefined) => supplier?.name || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => amount.toLocaleString('vi-VN') + ' VND',
      sorter: (a: ImportModel, b: ImportModel) => a.total_amount - b.total_amount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        let text = 'Đang xử lý';
        
        switch (status) {
          case 'completed':
            color = 'green';
            text = 'Hoàn thành';
            break;
          case 'cancelled':
            color = 'red';
            text = 'Đã hủy';
            break;
        }
        
        return <Badge status={color as any} text={text} />;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ImportModel) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => router.push(`/admin/inventory/imports/${record.id}`)}
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="Hoàn thành">
                <Button 
                  type="primary" 
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleUpdateStatus(record.id, 'completed')}
                />
              </Tooltip>
              <Tooltip title="Hủy">
                <Button 
                  danger 
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleUpdateStatus(record.id, 'cancelled')}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];
  
  if (loading && imports.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large">
          <div className="mt-3">Đang tải dữ liệu nhập kho...</div>
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
          <Title level={4}>Quản lý nhập kho</Title>
          <Text type="secondary">Danh sách các phiếu nhập kho</Text>
        </div>
        <div className="mt-2 sm:mt-0">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => router.push('/admin/inventory/imports/create')}
          >
            Tạo phiếu nhập mới
          </Button>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input 
            placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp" 
            prefix={<SearchOutlined />} 
            value={searchText}
            onChange={handleSearch}
            allowClear
          />
        </div>
        
        <div>
          <Select
            placeholder="Lọc theo nhà cung cấp"
            style={{ width: '100%' }}
            value={selectedSupplier}
            onChange={handleSupplierChange}
            allowClear
          >
            {suppliers.map(supplier => (
              <Option key={supplier.id} value={supplier.id}>{supplier.name}</Option>
            ))}
          </Select>
        </div>
        
        <div>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: '100%' }}
            value={selectedStatus}
            onChange={handleStatusChange}
            allowClear
          >
            <Option value="pending">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
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
        dataSource={filteredImports} 
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu nhập`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};

export default function AdminImportsPage() {
  return (
    <AdminLayout title="Quản lý nhập kho">
      <div className="p-6">
        <AdminImportsList />
      </div>
    </AdminLayout>
  );
}
