'use client';

import React, { useCallback } from 'react';
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
  Row,
  Col,
  Statistic,
  Avatar,
  Drawer,
  Descriptions,
  notification,
  message,
  List,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  ExportOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dayjs } from 'dayjs';
import moment from 'moment';
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
  const [selectedExport, setSelectedExport] = useState<ExportModel | null>(null);
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [exportStats, setExportStats] = useState<{
    totalExports: number;
    thisMonthExports: number;
    totalValue: number;
    thisMonthValue: number;
    totalQuantity: number;
    uniqueCreators: number;
    reasonBreakdown: {
      usage: number;
      damaged: number;
      expired: number;
      other: number;
    };
  }>({
    totalExports: 0,
    thisMonthExports: 0,
    totalValue: 0,
    thisMonthValue: 0,
    totalQuantity: 0,
    uniqueCreators: 0,
    reasonBreakdown: {
      usage: 0,
      damaged: 0,
      expired: 0,
      other: 0,
    }
  });
  
  // Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const fetchExportStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const currentDate = moment();
      const thisMonth = exports.filter(exp => 
        moment(exp.export_date).month() === currentDate.month() &&
        moment(exp.export_date).year() === currentDate.year()
      );
      
      const stats = {
        totalExports: exports.length,
        thisMonthExports: thisMonth.length,
        totalValue: exports.reduce((sum, exp) => {
          if (exp.items && Array.isArray(exp.items)) {
            return sum + exp.items.reduce((itemSum, item) => 
              itemSum + ((item.batch?.unit_price || 0) * item.quantity), 0
            );
          }
          return sum;
        }, 0),
        thisMonthValue: thisMonth.reduce((sum, exp) => {
          if (exp.items && Array.isArray(exp.items)) {
            return sum + exp.items.reduce((itemSum, item) => 
              itemSum + ((item.batch?.unit_price || 0) * item.quantity), 0
            );
          }
          return sum;
        }, 0),
        totalQuantity: exports.reduce((sum, exp) => sum + (exp.total_quantity || 0), 0),
        uniqueCreators: new Set(exports.map(exp => exp.created_by)).size,
        reasonBreakdown: {
          usage: exports.filter(exp => exp.reason === 'usage').length,
          damaged: exports.filter(exp => exp.reason === 'damaged').length,
          expired: exports.filter(exp => exp.reason === 'expired').length,
          other: exports.filter(exp => exp.reason === 'other').length,
        }
      };
      
      setExportStats(stats);
    } catch (err) {
      console.error('Error calculating export stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [exports]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare filters
      const filters: {
        reason?: string;
        created_by?: string;
        startDate?: Date;
        endDate?: Date;
      } = {};
      if (selectedReason) filters.reason = selectedReason;
      if (selectedCreatedBy) filters.created_by = selectedCreatedBy;
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].toDate();
        filters.endDate = dateRange[1].toDate();
      }
      
      // Fetch exports with filters
      const exportsData = await exportService.getAll(filters);
      setExports(exportsData);
      setError(null);
      
      // Update stats after fetching data
      setTimeout(() => fetchExportStats(), 100);
    } catch (err: unknown) {
      console.error('Error fetching exports data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu xuất kho';
      setError(errorMessage);
      notification.error({
        message: 'Lỗi tải dữ liệu',
        description: errorMessage,
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedReason, selectedCreatedBy, dateRange, fetchExportStats]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    fetchExportStats();
  }, [fetchExportStats]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
  };

  const handleReasonChange = (value: string | null) => {
    setSelectedReason(value);
  };

  const handleCreatedByChange = (value: string | null) => {
    setSelectedCreatedBy(value);
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedReason(null);
    setSelectedCreatedBy(null);
    setDateRange(null);
    message.success('Đã xóa tất cả bộ lọc');
  };

  const refreshData = async () => {
    await fetchData();
    message.success('Đã làm mới dữ liệu');
  };

  const calculateTotalValue = (exportItem: ExportModel) => {
    if (!exportItem.items || !Array.isArray(exportItem.items)) return 0;
    return exportItem.items.reduce((sum, item) => 
      sum + ((item.batch?.unit_price || 0) * item.quantity), 0
    );
  };

  const getExportStatus = (exportItem: ExportModel) => {
    const daysSinceExport = moment().diff(moment(exportItem.export_date), 'days');
    
    if (daysSinceExport === 0) {
      return { status: 'today', text: 'Hôm nay', color: 'green' };
    } else if (daysSinceExport <= 7) {
      return { status: 'recent', text: 'Gần đây', color: 'blue' };
    } else if (daysSinceExport <= 30) {
      return { status: 'this_month', text: 'Tháng này', color: 'orange' };
    } else {
      return { status: 'old', text: 'Cũ', color: 'default' };
    }
  };

  const filteredExports = exports.filter(item => 
    (item.reference_number || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (item.created_by || '').toLowerCase().includes(searchText.toLowerCase()) ||
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
      title: 'ID Phiếu',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (text: string, record: ExportModel) => (
        <Link href={`/admin/inventory/exports/${record.id}`}>
          <div className="font-medium text-blue-600 hover:text-blue-800">
            <div className="text-sm font-mono">#{text.substring(0, 8)}</div>
            <div className="text-xs text-gray-500">
              {moment(record.export_date).fromNow()}
            </div>
          </div>
        </Link>
      ),
    },
    {
      title: 'Ngày xuất',
      dataIndex: 'export_date',
      key: 'export_date',
      width: 120,
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
      sorter: (a: ExportModel, b: ExportModel) => moment(a.export_date).unix() - moment(b.export_date).unix(),
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_by',
      key: 'created_by',
      width: 150,
      render: (user: string) => (
        <div className="flex items-center space-x-2">
          <Avatar 
            size="small" 
            icon={<UserOutlined />}
          />
          <span className="text-sm">{user || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Thông tin xuất',
      key: 'export_info',
      width: 200,
      render: (_: unknown, record: ExportModel) => {
        const status = getExportStatus(record);
        const itemCount = record.items?.length || 0;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Tag color="blue" className="mb-1">
                <MinusCircleOutlined /> {itemCount} mặt hàng
              </Tag>
              <Tag color={status.color}>{status.text}</Tag>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Tổng SL:</span>
              <span className="text-xs font-medium">{record.total_quantity || 0}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              {getReasonTag(record.reason)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tổng giá trị',
      key: 'total_value',
      width: 140,
      render: (_: unknown, record: ExportModel) => {
        const value = calculateTotalValue(record);
        return (
          <div className="text-right">
            <div className="font-medium text-red-600 text-base">
              {value.toLocaleString('vi-VN')} ₫
            </div>
            <div className="text-xs text-gray-500">
              {value > 1000000 ? `${(value/1000000).toFixed(1)}M` : 
               value > 1000 ? `${(value/1000).toFixed(0)}K` : ''}
            </div>
          </div>
        );
      },
      sorter: (a: ExportModel, b: ExportModel) => calculateTotalValue(a) - calculateTotalValue(b),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      render: (notes: string | null) => (
        <div className="max-w-[150px] truncate">
          {notes ? (
            <Tooltip title={notes}>
              <span className="text-gray-600">{notes}</span>
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
      render: (_: unknown, record: ExportModel) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => {
                setSelectedExport(record);
                setDrawerVisible(true);
              }}
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng phiếu xuất"
              value={exportStats.totalExports || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Xuất tháng này"
              value={exportStats.thisMonthExports || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng giá trị xuất"
              value={exportStats.totalValue || 0}
              formatter={(value) => `${(value as number).toLocaleString('vi-VN')} ₫`}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng số lượng"
              value={exportStats.totalQuantity || 0}
              prefix={<ExportOutlined />}
              valueStyle={{ color: '#722ed1' }}
              loading={statsLoading}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div>
            <Title level={4}>Quản lý xuất kho</Title>
            <Text type="secondary">
              Danh sách các phiếu xuất kho
              {filteredExports.length > 0 && ` (${filteredExports.length} phiếu)`}
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
              onClick={() => router.push('/admin/inventory/exports/create')}
            >
              Tạo phiếu xuất mới
            </Button>
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input 
              placeholder="Tìm kiếm theo mã phiếu, người tạo" 
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
            <Select
              placeholder="Lọc theo người tạo"
              style={{ width: '100%' }}
              value={selectedCreatedBy}
              onChange={handleCreatedByChange}
              allowClear
            >
              {Array.from(new Set(exports.map(exp => exp.created_by))).map(creator => (
                <Option key={creator} value={creator}>{creator}</Option>
              ))}
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
          
          {exportStats.reasonBreakdown?.expired > 0 && (
            <Alert
              message={`${exportStats.reasonBreakdown.expired} phiếu xuất do hết hạn`}
              type="warning"
              showIcon
              className="mb-0"
            />
          )}
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredExports} 
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} phiếu xuất`,
            showQuickJumper: true
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Export Detail Drawer */}
      <Drawer
        title="Chi tiết phiếu xuất kho"
        width={800}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedExport(null);
        }}
        extra={
          <Space>
            <Button 
              icon={<FileTextOutlined />}
              onClick={() => {
                if (selectedExport) {
                  router.push(`/admin/inventory/exports/${selectedExport.id}`);
                }
              }}
            >
              Xem đầy đủ
            </Button>
          </Space>
        }
      >
        {selectedExport && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card size="small" title="Thông tin cơ bản">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic 
                    title="ID Phiếu xuất" 
                    value={selectedExport.id.substring(0, 8) + '...'} 
                    prefix={<FileTextOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Ngày xuất" 
                    value={moment(selectedExport.export_date).format('DD/MM/YYYY HH:mm')}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
              </Row>
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <div>
                    <Typography.Text strong>Người tạo:</Typography.Text>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar 
                        size="small" 
                        icon={<UserOutlined />}
                      />
                      <span>{selectedExport.created_by}</span>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <Statistic 
                    title="Tổng giá trị" 
                    value={calculateTotalValue(selectedExport)}
                    formatter={(value) => `${(value as number).toLocaleString('vi-VN')} ₫`}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<DollarOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* Export Information */}
            <Card size="small" title="Thông tin xuất kho">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Mã phiếu xuất">
                  <Typography.Text strong>{selectedExport.reference_number || `#${selectedExport.id.substring(0, 8)}`}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Lý do xuất kho">
                  {getReasonTag(selectedExport.reason)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng số lượng">
                  <Typography.Text strong>{selectedExport.total_quantity || 0}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số mặt hàng">
                  <Typography.Text strong>{selectedExport.items?.length || 0} mặt hàng</Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Note */}
            {selectedExport.notes && (
              <Card size="small" title="Ghi chú">
                <Typography.Text>{selectedExport.notes}</Typography.Text>
              </Card>
            )}

            {/* Items Information */}
            <Card size="small" title={`Chi tiết mặt hàng xuất (${selectedExport.items?.length || 0} mặt hàng)`}>
              {selectedExport.items?.length > 0 ? (
                <List
                  dataSource={selectedExport.items}
                  renderItem={(item, index: number) => (
                    <List.Item key={item.id || index}>
                      <List.Item.Meta
                        avatar={
                          <div className="relative">
                            <Avatar 
                              size={60}
                              shape="square"
                              src={item.ingredient?.image_url}
                              icon={<ShoppingCartOutlined />}
                            />
                            {item.batch?.expiry_date && moment(item.batch.expiry_date).isBefore(moment().add(7, 'days')) && (
                              <Tooltip title="Lô hàng gần hết hạn">
                                <WarningOutlined className="absolute -top-1 -right-1 text-red-500" />
                              </Tooltip>
                            )}
                          </div>
                        }
                        title={
                          <div className="flex justify-between items-start">
                            <div>
                              <Typography.Text strong>{item.ingredient?.name}</Typography.Text>
                              <div className="text-sm text-gray-500">
                                Lô: {item.batch?.lot_number || 'N/A'}
                              </div>
                            </div>
                            <Tag color="red">
                              Đã xuất
                            </Tag>
                          </div>
                        }
                        description={
                          <Row gutter={16}>
                            <Col span={6}>
                              <Typography.Text type="secondary">Số lượng xuất:</Typography.Text>
                              <div><Typography.Text strong>{item.quantity} {item.ingredient?.unit}</Typography.Text></div>
                            </Col>
                            <Col span={6}>
                              <Typography.Text type="secondary">Đơn giá:</Typography.Text>
                              <div><Typography.Text strong>{item.batch?.unit_price?.toLocaleString('vi-VN')} ₫</Typography.Text></div>
                            </Col>
                            <Col span={6}>
                              <Typography.Text type="secondary">Thành tiền:</Typography.Text>
                              <div><Typography.Text strong>{((item.batch?.unit_price || 0) * item.quantity).toLocaleString('vi-VN')} ₫</Typography.Text></div>
                            </Col>
                            <Col span={6}>
                              <Typography.Text type="secondary">HSD lô:</Typography.Text>
                              <div>
                                <Typography.Text 
                                  strong 
                                  type={item.batch?.expiry_date && moment(item.batch.expiry_date).isBefore(moment()) ? 'danger' : 
                                        item.batch?.expiry_date && moment(item.batch.expiry_date).isBefore(moment().add(7, 'days')) ? 'warning' : 'success'}
                                >
                                  {item.batch?.expiry_date ? moment(item.batch.expiry_date).format('DD/MM/YYYY') : 'N/A'}
                                </Typography.Text>
                              </div>
                            </Col>
                          </Row>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCartOutlined style={{ fontSize: 48 }} />
                  <div className="mt-2">Không có mặt hàng nào</div>
                </div>
              )}
            </Card>
          </div>
        )}
      </Drawer>
    </div>
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
