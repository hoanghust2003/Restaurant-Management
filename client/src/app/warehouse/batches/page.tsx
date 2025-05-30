'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Typography,
  Tooltip,
  Spin,
  Alert,
  Tag,
  Select,
  DatePicker,
  Badge,
  Popconfirm,
  message
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ClearOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { batchService } from '@/app/services/warehouse.service';
import { ingredientService } from '@/app/services/ingredient.service';
import { IngredientModel } from '@/app/models/ingredient.model';
import { BatchModel } from '@/app/models/warehouse.model';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BatchesList: React.FC = () => {
  const router = useRouter();
  const [batches, setBatches] = useState<BatchModel[]>([]);
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [filters, setFilters] = useState<{
    ingredient_id?: string;
    status?: string;
    expiring_soon?: boolean;
    date_range?: [moment.Moment, moment.Moment] | null;
  }>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchIngredients();
    fetchBatches();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await ingredientService.getAll();
      setIngredients(data);
    } catch (err: any) {
      console.error('Error fetching ingredients:', err);
      // Not showing error as it's not critical
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await batchService.getAll(filters);
      setBatches(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching batches:', err);
      setError(err.message || 'Không thể tải danh sách lô hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchBatches();
  };

  const clearFilters = () => {
    setFilters({});
    setSearchText('');
    fetchBatches();
  };

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'depleted':
        return 'default';
      case 'expired':
        return 'red';
      case 'damaged':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getBatchStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Khả dụng';
      case 'depleted':
        return 'Đã hết';
      case 'expired':
        return 'Hết hạn';
      case 'damaged':
        return 'Hư hỏng';
      default:
        return 'Không xác định';
    }
  };

  const isExpiringSoon = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    const expiry = moment(expiryDate);
    const today = moment();
    const daysUntilExpiry = expiry.diff(today, 'days');
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: Date) => {
    if (!expiryDate) return false;
    return moment(expiryDate).isBefore(moment(), 'day');
  };

  const filteredBatches = batches.filter(batch => {
    // Check if search text matches ingredient name or lot number
    const searchMatches = 
      !searchText || 
      (batch.ingredient?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (batch.lot_number || '').toLowerCase().includes(searchText.toLowerCase());
    
    return searchMatches;
  });

  const columns = [
    {
      title: 'Nguyên liệu',
      dataIndex: 'ingredient',
      key: 'ingredient',
      render: (ingredient?: IngredientModel) => (
        ingredient ? (
          <Link href={`/warehouse/ingredients/${ingredient.id}`}>
            <span className="font-medium text-blue-600 hover:text-blue-800">
              {ingredient.name}
            </span>
          </Link>
        ) : 'N/A'
      ),
    },
    {
      title: 'Số lô',
      dataIndex: 'lot_number',
      key: 'lot_number',
      render: (lotNumber?: string) => lotNumber || 'N/A',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (supplier: any) => (
        supplier ? (
          <Link href={`/warehouse/suppliers/${supplier.id}`}>
            <span className="text-blue-600 hover:text-blue-800">
              {supplier.name}
            </span>
          </Link>
        ) : 'N/A'
      ),
    },
    {
      title: 'Số lượng ban đầu',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: BatchModel) => (
        <span>
          {quantity.toLocaleString('vi-VN')} {record.ingredient?.unit || ''}
        </span>
      ),
      sorter: (a: BatchModel, b: BatchModel) => a.quantity - b.quantity,
    },
    {
      title: 'Số lượng còn lại',
      dataIndex: 'remaining_quantity',
      key: 'remaining_quantity',
      render: (remainingQuantity: number, record: BatchModel) => (
        <span className={remainingQuantity === 0 ? 'text-red-500' : ''}>
          {remainingQuantity.toLocaleString('vi-VN')} {record.ingredient?.unit || ''}
        </span>
      ),
      sorter: (a: BatchModel, b: BatchModel) => a.remaining_quantity - b.remaining_quantity,
    },
    {
      title: 'HSD',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (expiryDate?: Date) => {
        if (!expiryDate) return 'N/A';
        
        const formattedDate = moment(expiryDate).format('DD/MM/YYYY');
        
        if (isExpired(expiryDate)) {
          return <span className="text-red-500 font-medium">{formattedDate} (Hết hạn)</span>;
        }
        
        if (isExpiringSoon(expiryDate)) {
          return <span className="text-orange-500 font-medium">{formattedDate} (Sắp hết hạn)</span>;
        }
        
        return formattedDate;
      },
      sorter: (a: BatchModel, b: BatchModel) => {
        if (!a.expiry_date && !b.expiry_date) return 0;
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={getBatchStatusColor(status) as any} 
          text={getBatchStatusText(status)} 
        />
      ),
      filters: [
        { text: 'Khả dụng', value: 'available' },
        { text: 'Đã hết', value: 'depleted' },
        { text: 'Hết hạn', value: 'expired' },
        { text: 'Hư hỏng', value: 'damaged' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: Date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a: BatchModel, b: BatchModel) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: BatchModel) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => router.push(`/warehouse/batches/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Xuất kho">
            <Button 
              icon={<FileDoneOutlined />} 
              size="small"
              type="primary"
              disabled={record.remaining_quantity <= 0 || record.status !== 'available'}
              onClick={() => router.push(`/warehouse/exports/create?batch=${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (loading && batches.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách lô hàng..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <Title level={4}>Quản lý lô hàng</Title>
            <Text type="secondary">Danh sách các lô nguyên liệu trong kho</Text>
          </div>
          <div className="mt-2 sm:mt-0">
            <Button 
              type="primary"
              onClick={() => router.push('/warehouse/imports/create')}
            >
              Nhập kho mới
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <Button 
            icon={showFilters ? <ClearOutlined /> : <FilterOutlined />} 
            onClick={() => setShowFilters(!showFilters)}
            className="mb-3"
          >
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Button>
          
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nguyên liệu
                  </label>
                  <Select
                    placeholder="Chọn nguyên liệu"
                    allowClear
                    style={{ width: '100%' }}
                    value={filters.ingredient_id}
                    onChange={(value) => handleFilterChange('ingredient_id', value)}
                  >
                    {ingredients.map(ingredient => (
                      <Option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </Option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <Select
                    placeholder="Chọn trạng thái"
                    allowClear
                    style={{ width: '100%' }}
                    value={filters.status}
                    onChange={(value) => handleFilterChange('status', value)}
                  >
                    <Option value="available">Khả dụng</Option>
                    <Option value="depleted">Đã hết</Option>
                    <Option value="expired">Hết hạn</Option>
                    <Option value="damaged">Hư hỏng</Option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày nhập
                  </label>
                  <RangePicker 
                    style={{ width: '100%' }}
                    onChange={(dates) => handleFilterChange('date_range', dates)}
                    value={filters.date_range as any}
                    format="DD/MM/YYYY"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button 
                  type="primary" 
                  onClick={applyFilters}
                  icon={<FilterOutlined />}
                >
                  Lọc kết quả
                </Button>
                <Button 
                  onClick={clearFilters}
                  icon={<ClearOutlined />}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-1/3">
              <Input 
                placeholder="Tìm kiếm theo tên nguyên liệu, số lô..." 
                prefix={<SearchOutlined />} 
                value={searchText}
                onChange={handleSearch}
                allowClear
              />
            </div>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchBatches}
            >
              Làm mới
            </Button>
            
            <Space>
              <Tag color="green">Khả dụng: {batches.filter(b => b.status === 'available').length}</Tag>
              <Tag color="red">Hết hạn: {batches.filter(b => b.status === 'expired').length}</Tag>
              <Tag color="orange">Sắp hết hạn: {batches.filter(b => isExpiringSoon(b.expiry_date)).length}</Tag>
            </Space>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredBatches} 
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lô hàng`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default function BatchesPage() {
  return (
    <div className="p-6">
      <BatchesList />
    </div>
  );
}
