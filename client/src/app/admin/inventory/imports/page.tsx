'use client';

import React, { useState, useEffect } from 'react';
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
  message,
  Avatar,
  Descriptions,
  Drawer,
  List,
  Image,
  Statistic,
  Row,
  Col,
  Divider,
  Progress,
  Empty,
  Modal,
  Popconfirm,
  notification
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  FileTextOutlined,
  WarningOutlined,
  SyncOutlined,
  BarChartOutlined,
  PrinterOutlined,
  ExportOutlined,
  DeleteOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import moment from 'moment';
import dayjs, { Dayjs } from 'dayjs';
import { importService, supplierService } from '@/app/services/warehouse.service';

// Interface definitions
interface IngredientModel {
  id: string;
  name: string;
  unit: string;
  threshold: number;
  image_url: string | null;
  created_at: string;
  deleted_at: string | null;
}

interface BatchModel {
  id: string;
  importId: string;
  ingredientId: string;
  ingredient: IngredientModel;
  name: string;
  quantity: number;
  remaining_quantity: number;
  expiry_date: string;
  price: number;
  created_at: string;
  deleted_at: string | null;
  status: string;
}

interface UserModel {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  created_at: string;
  deleted_at: string | null;
}

interface SupplierModel {
  id: string;
  name: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  created_at: string;
  deleted_at: string | null;
}

interface ImportModel {
  id: string;
  createdById: string;
  created_by: UserModel;
  supplierId: string;
  supplier: SupplierModel;
  note: string | null;
  batches: BatchModel[];
  created_at: string;
  deleted_at: string | null;
  total_value: number;
}

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminImportsList: React.FC = () => {
  const router = useRouter();
  const [imports, setImports] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImport, setSelectedImport] = useState<any | null>(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [importStats, setImportStats] = useState<any>({});
  
  // Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  React.useEffect(() => {
    fetchData();
    fetchImportStats();
  }, [selectedSupplier, selectedStatus, dateRange]);

  const fetchImportStats = async () => {
    try {
      setStatsLoading(true);
      // Calculate statistics from current imports data
      const currentDate = moment();
      const thisMonth = imports.filter(imp => 
        moment(imp.created_at).month() === currentDate.month() &&
        moment(imp.created_at).year() === currentDate.year()
      );
      
      const stats = {
        totalImports: imports.length,
        thisMonthImports: thisMonth.length,
        totalValue: imports.reduce((sum, imp) => sum + (imp.total_value || 0), 0),
        thisMonthValue: thisMonth.reduce((sum, imp) => sum + (imp.total_value || 0), 0),
        averageValue: imports.length > 0 ? imports.reduce((sum, imp) => sum + (imp.total_value || 0), 0) / imports.length : 0,
        totalBatches: imports.reduce((sum, imp) => sum + (imp.batches?.length || 0), 0),
        uniqueSuppliers: new Set(imports.map(imp => imp.supplierId)).size,
        expiringBatches: imports.reduce((sum, imp) => {
          const expiring = imp.batches?.filter((batch: any) => 
            moment(batch.expiry_date).isBefore(moment().add(30, 'days'))
          ).length || 0;
          return sum + expiring;
        }, 0)
      };
      
      setImportStats(stats);
    } catch (err) {
      console.error('Error calculating import stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

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
      
      // Update stats after fetching data
      setTimeout(() => fetchImportStats(), 100);
    } catch (err: any) {
      console.error('Error fetching imports data:', err);
      setError(err.message || 'Không thể tải dữ liệu nhập kho');
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: err.message || 'Không thể tải dữ liệu nhập kho',
        placement: 'topRight'
      });
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
    message.success('Đã xóa tất cả bộ lọc');
  };

  const refreshData = async () => {
    await fetchData();
    message.success('Đã làm mới dữ liệu');
  };

  const calculateBatchesUsage = (batches: any[]) => {
    if (!batches || batches.length === 0) return 0;
    
    const totalOriginal = batches.reduce((sum, batch) => sum + batch.quantity, 0);
    const totalRemaining = batches.reduce((sum, batch) => sum + batch.remaining_quantity, 0);
    
    return totalOriginal > 0 ? ((totalOriginal - totalRemaining) / totalOriginal) * 100 : 0;
  };

  const getImportStatus = (importItem: any) => {
    if (!importItem.batches || importItem.batches.length === 0) {
      return { status: 'empty', text: 'Không có lô hàng', color: 'default' };
    }
    
    const usage = calculateBatchesUsage(importItem.batches);
    
    if (usage === 0) {
      return { status: 'new', text: 'Mới', color: 'blue' };
    } else if (usage < 50) {
      return { status: 'in_use', text: 'Đang sử dụng', color: 'green' };
    } else if (usage < 100) {
      return { status: 'mostly_used', text: 'Gần hết', color: 'orange' };
    } else {
      return { status: 'depleted', text: 'Đã hết', color: 'red' };
    }
  };

  const filteredImports = imports.filter(item => 
    (item.id?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (item.supplier?.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (item.note || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'ID Phiếu',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (text: string, record: any) => (
        <Link href={`/admin/inventory/imports/${record.id}`}>
          <div className="font-medium text-blue-600 hover:text-blue-800">
            <div className="text-sm font-mono">#{text.substring(0, 8)}</div>
            <div className="text-xs text-gray-500">
              {moment(record.created_at).fromNow()}
            </div>
          </div>
        </Link>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a: any, b: any) => moment(a.created_at).unix() - moment(b.created_at).unix(),
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_by',
      key: 'created_by',
      width: 150,
      render: (user: any) => (
        <div className="flex items-center space-x-2">
          <Avatar 
            size="small" 
            src={user?.avatar_url} 
            icon={<UserOutlined />}
          />
          <span className="text-sm">{user?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 180,
      render: (supplier: any) => (
        <div>
          <div className="font-medium">{supplier?.name || 'N/A'}</div>
          <div className="text-xs text-gray-500">{supplier?.contact_phone}</div>
        </div>
      ),
    },
    {
      title: 'Thông tin lô hàng',
      key: 'batch_info',
      width: 250,
      render: (_: any, record: any) => {
        const usage = calculateBatchesUsage(record.batches);
        const status = getImportStatus(record);
        
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Tag color={status.color} className="mb-1">
                <ShoppingCartOutlined /> {record.batches?.length || 0} lô
              </Tag>
              <Tag color={status.color}>{status.text}</Tag>
            </div>
            
            {record.batches && record.batches.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Mức sử dụng</span>
                  <span>{usage.toFixed(1)}%</span>
                </div>
                <Progress 
                  percent={usage} 
                  size="small" 
                  strokeColor={
                    usage === 0 ? '#1890ff' :
                    usage < 50 ? '#52c41a' :
                    usage < 100 ? '#faad14' : '#ff4d4f'
                  }
                  showInfo={false}
                />
              </div>
            )}
            
            {/* Show expiring batches warning */}
            {record.batches?.some((batch: any) => 
              moment(batch.expiry_date).isBefore(moment().add(30, 'days'))
            ) && (
              <div className="flex items-center text-orange-500">
                <WarningOutlined className="mr-1 text-xs" />
                <span className="text-xs">Có lô sắp hết hạn</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'total_value',
      key: 'total_value',
      width: 140,
      render: (amount: number | undefined) => {
        const value = amount || 0;
        return (
          <div className="text-right">
            <div className="font-medium text-green-600 text-base">
              {value.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-gray-500">
              {value > 1000000 ? `${(value/1000000).toFixed(1)}M` : 
               value > 1000 ? `${(value/1000).toFixed(0)}K` : ''}
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => (a.total_value || 0) - (b.total_value || 0),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      render: (note: string | null) => (
        <div className="max-w-[150px] truncate">
          {note ? (
            <Tooltip title={note}>
              <span className="text-gray-600">{note}</span>
            </Tooltip>
          ) : (
            <span className="text-gray-400 italic">Không có ghi chú</span>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedImport(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng phiếu nhập"
              value={importStats.totalImports || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Nhập tháng này"
              value={importStats.thisMonthImports || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng giá trị"
              value={importStats.totalValue || 0}
              formatter={(value) => `${(value as number).toLocaleString('vi-VN')} ₫`}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Nhà cung cấp"
              value={importStats.uniqueSuppliers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="nhà"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <Title level={4}>Quản lý nhập kho</Title>
            <Text type="secondary">
              Danh sách các phiếu nhập kho
              {filteredImports.length > 0 && ` (${filteredImports.length} phiếu)`}
            </Text>
          </div>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Tooltip title="Làm mới dữ liệu">
              <Button 
                icon={<ReloadOutlined />}
                onClick={refreshData}
                loading={loading}
              >
                Làm mới
              </Button>
            </Tooltip>
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
              <Option value="new">Mới</Option>
              <Option value="in_use">Đang sử dụng</Option>
              <Option value="mostly_used">Gần hết</Option>
              <Option value="depleted">Đã hết</Option>
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
        
        <div className="mb-4 flex justify-between items-center">
          <Button icon={<FilterOutlined />} onClick={resetFilters}>
            Xóa bộ lọc
          </Button>
          
          {importStats.expiringBatches > 0 && (
            <Alert
              message={`${importStats.expiringBatches} lô hàng sắp hết hạn trong 30 ngày tới`}
              type="warning"
              showIcon
              className="mb-0"
            />
          )}
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredImports} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu nhập`,
            showQuickJumper: true
          }}
          scroll={{ x: 'max-content' }}
        />

        {/* Detail Drawer */}
        <Drawer
          title="Chi tiết phiếu nhập kho"
          width={800}
          open={drawerVisible}
          onClose={() => {
            setDrawerVisible(false);
            setSelectedImport(null);
          }}
          extra={
            <Space>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => {
                  if (selectedImport) {
                    router.push(`/admin/inventory/imports/${selectedImport.id}`);
                  }
                }}
              >
                Xem đầy đủ
              </Button>
            </Space>
          }
        >
          {selectedImport && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card size="small" title="Thông tin cơ bản">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="ID Phiếu nhập" 
                      value={selectedImport.id.substring(0, 8) + '...'} 
                      prefix={<FileTextOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Ngày tạo" 
                      value={moment(selectedImport.created_at).format('DD/MM/YYYY HH:mm')}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Người tạo:</Text>
                      <div className="flex items-center space-x-2 mt-1">
                        <Avatar 
                          size="small" 
                          src={selectedImport.created_by?.avatar_url} 
                          icon={<UserOutlined />}
                        />
                        <span>{selectedImport.created_by?.name}</span>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Tổng giá trị" 
                      value={selectedImport.total_value}
                      formatter={(value) => `${(value as number).toLocaleString('vi-VN')} ₫`}
                      valueStyle={{ color: '#3f8600' }}
                      prefix={<DollarOutlined />}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Supplier Information */}
              <Card size="small" title="Thông tin nhà cung cấp">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Tên nhà cung cấp">
                    <Text strong>{selectedImport.supplier?.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người liên hệ">
                    {selectedImport.supplier?.contact_name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    <Text copyable>{selectedImport.supplier?.contact_phone}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    <Text copyable>{selectedImport.supplier?.contact_email}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {selectedImport.supplier?.address}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Note */}
              {selectedImport.note && (
                <Card size="small" title="Ghi chú">
                  <Text>{selectedImport.note}</Text>
                </Card>
              )}

              {/* Batches Information */}
              <Card size="small" title={`Danh sách lô hàng (${selectedImport.batches?.length || 0} lô)`}>
                {selectedImport.batches?.length > 0 ? (
                  <List
                    dataSource={selectedImport.batches}
                    renderItem={(batch: any, index: number) => (
                      <List.Item key={batch.id}>
                        <List.Item.Meta
                          avatar={
                            <div className="relative">
                              <Avatar 
                                size={60}
                                shape="square"
                                src={batch.ingredient?.image_url}
                                icon={<ShoppingCartOutlined />}
                              />
                              {moment(batch.expiry_date).isBefore(moment().add(7, 'days')) && (
                                <Tooltip title="Sắp hết hạn">
                                  <WarningOutlined className="absolute -top-1 -right-1 text-red-500" />
                                </Tooltip>
                              )}
                            </div>
                          }
                          title={
                            <div className="flex justify-between items-start">
                              <div>
                                <Text strong>{batch.ingredient?.name}</Text>
                                <div className="text-sm text-gray-500">
                                  Lô: {batch.name}
                                </div>
                              </div>
                              <Tag 
                                color={batch.status === 'available' ? 'green' : 'default'}
                              >
                                {batch.status === 'available' ? 'Có sẵn' : 'Không có sẵn'}
                              </Tag>
                            </div>
                          }
                          description={
                            <Row gutter={16}>
                              <Col span={6}>
                                <Text type="secondary">Số lượng:</Text>
                                <div><Text strong>{batch.quantity} {batch.ingredient?.unit}</Text></div>
                              </Col>
                              <Col span={6}>
                                <Text type="secondary">Còn lại:</Text>
                                <div><Text strong>{batch.remaining_quantity} {batch.ingredient?.unit}</Text></div>
                              </Col>
                              <Col span={6}>
                                <Text type="secondary">Đơn giá:</Text>
                                <div><Text strong>{batch.price?.toLocaleString('vi-VN')} ₫</Text></div>
                              </Col>
                              <Col span={6}>
                                <Text type="secondary">Hạn sử dụng:</Text>
                                <div>
                                  <Text 
                                    strong 
                                    type={moment(batch.expiry_date).isBefore(moment()) ? 'danger' : 
                                          moment(batch.expiry_date).isBefore(moment().add(7, 'days')) ? 'warning' : 'success'}
                                  >
                                    {moment(batch.expiry_date).format('DD/MM/YYYY')}
                                  </Text>
                                </div>
                              </Col>
                            </Row>
                          }
                        />
                        <div className="ml-4">
                          <Text strong>
                            Thành tiền: {(batch.quantity * batch.price).toLocaleString('vi-VN')} ₫
                          </Text>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCartOutlined style={{ fontSize: 48 }} />
                    <div className="mt-2">Không có lô hàng nào</div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </Drawer>
      </Card>
    </div>
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
