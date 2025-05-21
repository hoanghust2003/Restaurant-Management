'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Tabs, 
  Table, 
  Tag, 
  Spin, 
  Alert, 
  Button, 
  Space, 
  Statistic, 
  Row, 
  Col,
  DatePicker,
  Select,
  Progress,
  Divider
} from 'antd';
import { 
  WarningOutlined, 
  ClockCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  DollarOutlined,
  FileExcelOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  batchService, 
  warehouseService 
} from '@/app/services/warehouse.service';
import { ingredientService } from '@/app/services/ingredient.service';
import { 
  BatchModel, 
  WarehouseStats
} from '@/app/models/warehouse.model';
import { IngredientModel } from '@/app/models/ingredient.model';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const WarehouseReportsPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('low-stock');
  const [lowStockItems, setLowStockItems] = useState<IngredientModel[]>([]);
  const [expiringItems, setExpiringItems] = useState<BatchModel[]>([]);
  const [expiredItems, setExpiredItems] = useState<BatchModel[]>([]);
  const [inventoryValue, setInventoryValue] = useState<any[]>([]);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsData = await warehouseService.getStats();
      setStats(statsData);

      if (activeTab === 'low-stock') {
        const data = await ingredientService.getLowStock();
        setLowStockItems(data);
      } else if (activeTab === 'expiring') {
        const data = await batchService.getAll({ expiring_soon: true });
        setExpiringItems(data);
      } else if (activeTab === 'expired') {
        const data = await batchService.getAll({ status: 'expired' });
        setExpiredItems(data);
      } else if (activeTab === 'inventory-value') {
        const data = await warehouseService.getInventoryValue();
        setInventoryValue(data);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // This would typically call a backend service to generate and download an Excel file
    alert('Tính năng xuất Excel đang được phát triển');
  };

  const lowStockColumns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.slice(0, 8),
    },
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IngredientModel) => (
        <Link href={`/warehouse/ingredients/${record.id}`}>
          <span className="font-medium text-blue-600 hover:text-blue-800">
            {text}
          </span>
        </Link>
      ),
    },
    {
      title: 'Còn lại',
      dataIndex: 'available_quantity',
      key: 'available_quantity',
      render: (quantity: number, record: IngredientModel) => (
        <div>
          <div className="font-medium text-red-500">
            {quantity.toLocaleString('vi-VN')} {record.unit}
          </div>
          <Progress 
            percent={Math.round((quantity / record.min_quantity) * 100)} 
            status="exception" 
            size="small" 
          />
        </div>
      ),
      sorter: (a: IngredientModel, b: IngredientModel) => 
        (a.available_quantity / a.min_quantity) - (b.available_quantity / b.min_quantity),
    },
    {
      title: 'Ngưỡng tối thiểu',
      dataIndex: 'min_quantity',
      key: 'min_quantity',
      render: (quantity: number, record: IngredientModel) => (
        `${quantity.toLocaleString('vi-VN')} ${record.unit}`
      ),
    },
    {
      title: 'Cần nhập thêm',
      key: 'needed',
      render: (_: any, record: IngredientModel) => {
        const needed = Math.max(0, record.min_quantity - record.available_quantity);
        return `${needed.toLocaleString('vi-VN')} ${record.unit}`;
      },
      sorter: (a: IngredientModel, b: IngredientModel) => 
        (a.min_quantity - a.available_quantity) - (b.min_quantity - b.available_quantity),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: IngredientModel) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            onClick={() => router.push(`/warehouse/imports/create?ingredient=${record.id}`)}
          >
            Nhập kho
          </Button>
          <Button 
            size="small"
            onClick={() => router.push(`/warehouse/ingredients/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const expiringColumns = [
    {
      title: 'Mã lô',
      dataIndex: 'lot_number',
      key: 'lot_number',
      render: (lotNumber: string, record: BatchModel) => (
        lotNumber || record.id.slice(0, 8)
      ),
    },
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
      title: 'Còn lại',
      dataIndex: 'remaining_quantity',
      key: 'remaining_quantity',
      render: (remainingQuantity: number, record: BatchModel) => (
        `${remainingQuantity.toLocaleString('vi-VN')} ${record.ingredient?.unit || ''}`
      ),
      sorter: (a: BatchModel, b: BatchModel) => a.remaining_quantity - b.remaining_quantity,
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (expiryDate?: Date) => {
        if (!expiryDate) return 'N/A';
        
        const expiry = moment(expiryDate);
        const today = moment();
        const daysUntilExpiry = expiry.diff(today, 'days');
        
        return (
          <div>
            <div>{moment(expiryDate).format('DD/MM/YYYY')}</div>
            <Tag color="orange">
              {daysUntilExpiry > 0 ? `Còn ${daysUntilExpiry} ngày` : 'Hết hạn'}
            </Tag>
          </div>
        );
      },
      sorter: (a: BatchModel, b: BatchModel) => {
        if (!a.expiry_date || !b.expiry_date) return 0;
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      },
    },
    {
      title: 'Giá trị còn lại',
      key: 'value',
      render: (_: any, record: BatchModel) => (
        `${(record.remaining_quantity * record.unit_price).toLocaleString('vi-VN')} VNĐ`
      ),
      sorter: (a: BatchModel, b: BatchModel) => 
        (a.remaining_quantity * a.unit_price) - (b.remaining_quantity * b.unit_price),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: BatchModel) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            danger
            onClick={() => router.push(`/warehouse/exports/create?batch=${record.id}`)}
          >
            Xuất kho
          </Button>
          <Button 
            size="small"
            onClick={() => router.push(`/warehouse/batches/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const expiredColumns = [
    ...expiringColumns.slice(0, 4),
    {
      title: 'Hết hạn từ',
      dataIndex: 'expiry_date',
      key: 'expired_since',
      render: (expiryDate?: Date) => {
        if (!expiryDate) return 'N/A';
        
        const expiry = moment(expiryDate);
        const today = moment();
        const daysSinceExpiry = today.diff(expiry, 'days');
        
        return (
          <div>
            <div>{moment(expiryDate).format('DD/MM/YYYY')}</div>
            <Tag color="red">
              {`${daysSinceExpiry} ngày trước`}
            </Tag>
          </div>
        );
      },
      sorter: (a: BatchModel, b: BatchModel) => {
        if (!a.expiry_date || !b.expiry_date) return 0;
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      },
    },
    expiringColumns[4], // Value column
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: BatchModel) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small"
            danger
            onClick={() => router.push(`/warehouse/exports/create?batch=${record.id}&reason=expired`)}
          >
            Xử lý hàng hết hạn
          </Button>
          <Button 
            size="small"
            onClick={() => router.push(`/warehouse/batches/${record.id}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const inventoryValueColumns = [
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Số lượng nguyên liệu',
      dataIndex: 'ingredientCount',
      key: 'ingredientCount',
      render: (text: number) => text.toLocaleString('vi-VN'),
    },
    {
      title: 'Tổng số lượng (các đơn vị)',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (text: number) => text.toLocaleString('vi-VN'),
    },
    {
      title: 'Giá trị tồn kho',
      dataIndex: 'value',
      key: 'value',
      render: (text: number) => `${text.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Tỷ lệ giá trị',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percent: number) => (
        <div>
          <div>{percent.toFixed(2)}%</div>
          <Progress percent={percent} size="small" />
        </div>
      ),
    },
  ];

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
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
          action={
            <Button type="primary" onClick={fetchData}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <Title level={4}>Báo cáo kho hàng</Title>
            <Text type="secondary">
              Xem thông tin về tình trạng tồn kho, hàng sắp hết hạn và giá trị tồn kho
            </Text>
          </div>
          <div className="mt-2 sm:mt-0 space-x-2">
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
              className="print-hidden"
            >
              In báo cáo
            </Button>
            <Button 
              icon={<FileExcelOutlined />} 
              onClick={handleExportExcel}
              className="print-hidden"
            >
              Xuất Excel
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              className="print-hidden"
            >
              Làm mới
            </Button>
          </div>
        </div>

        {stats && (
          <div className="mb-6 print-visible">
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="bg-blue-50">
                  <Statistic 
                    title="Tổng nguyên liệu" 
                    value={stats.total_ingredients} 
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="bg-red-50">
                  <Statistic 
                    title="Nguyên liệu sắp hết" 
                    value={stats.low_stock_count} 
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<WarningOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="bg-orange-50">
                  <Statistic 
                    title="Lô hàng sắp hết hạn" 
                    value={stats.expiring_soon_count} 
                    valueStyle={{ color: '#fa8c16' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Card className="bg-green-50">
                  <Statistic 
                    title="Tổng giá trị tồn kho" 
                    value={stats.total_value} 
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<DollarOutlined />}
                    suffix="VNĐ"
                    precision={0}
                    formatter={(value) => `${value.toLocaleString('vi-VN')}`}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          tabBarExtraContent={
            <div className="print-hidden">
              <Space>
                <RangePicker 
                  value={dateRange as any}
                  onChange={(dates) => setDateRange(dates as [moment.Moment, moment.Moment])}
                  format="DD/MM/YYYY"
                  placeholder={['Từ ngày', 'Đến ngày']}
                />
                <Button icon={<FilterOutlined />} onClick={fetchData}>
                  Lọc
                </Button>
              </Space>
            </div>
          }
          className="warehouse-report-tabs"
        >
          <TabPane 
            tab={
              <span>
                <WarningOutlined />
                Nguyên liệu sắp hết
                {stats?.low_stock_count ? <Tag color="red" className="ml-2">{stats.low_stock_count}</Tag> : null}
              </span>
            } 
            key="low-stock"
          >
            <div className="mb-4">
              <Text>
                Danh sách các nguyên liệu có số lượng dưới ngưỡng tối thiểu, cần nhập thêm hàng
              </Text>
            </div>
            
            <Table 
              columns={lowStockColumns} 
              dataSource={lowStockItems} 
              rowKey="id"
              loading={loading && activeTab === 'low-stock'}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} nguyên liệu`,
              }}
              locale={{ emptyText: 'Không có nguyên liệu nào dưới ngưỡng tối thiểu' }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <ClockCircleOutlined />
                Hàng sắp hết hạn
                {stats?.expiring_soon_count ? <Tag color="orange" className="ml-2">{stats.expiring_soon_count}</Tag> : null}
              </span>
            } 
            key="expiring"
          >
            <div className="mb-4">
              <Text>
                Danh sách các lô hàng sẽ hết hạn trong vòng 7 ngày tới, cần sử dụng hoặc xử lý
              </Text>
            </div>
            
            <Table 
              columns={expiringColumns} 
              dataSource={expiringItems} 
              rowKey="id"
              loading={loading && activeTab === 'expiring'}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lô hàng`,
              }}
              locale={{ emptyText: 'Không có lô hàng nào sắp hết hạn' }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <WarningOutlined />
                Hàng đã hết hạn
                {stats?.expired_count ? <Tag color="red" className="ml-2">{stats.expired_count}</Tag> : null}
              </span>
            } 
            key="expired"
          >
            <div className="mb-4">
              <Text>
                Danh sách các lô hàng đã hết hạn cần xử lý ngay
              </Text>
            </div>
            
            <Table 
              columns={expiredColumns} 
              dataSource={expiredItems} 
              rowKey="id"
              loading={loading && activeTab === 'expired'}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lô hàng`,
              }}
              locale={{ emptyText: 'Không có lô hàng nào đã hết hạn' }}
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <DollarOutlined />
                Giá trị tồn kho
              </span>
            } 
            key="inventory-value"
          >
            <div className="mb-4">
              <Text>
                Phân tích giá trị tồn kho theo danh mục nguyên liệu
              </Text>
            </div>
            
            <Table 
              columns={inventoryValueColumns} 
              dataSource={inventoryValue} 
              rowKey="category"
              loading={loading && activeTab === 'inventory-value'}
              pagination={false}
              summary={(pageData) => {
                let totalValue = 0;
                
                pageData.forEach(({ value }) => {
                  totalValue += value;
                });
                
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Tổng giá trị tồn kho</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{totalValue.toLocaleString('vi-VN')} VNĐ</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>100%</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
              locale={{ emptyText: 'Không có dữ liệu giá trị tồn kho' }}
            />
          </TabPane>
        </Tabs>
      </Card>
      
      <style jsx global>{`
        @media print {
          .ant-layout-header,
          .ant-layout-sider,
          .print-hidden {
            display: none !important;
          }
          
          .print-visible {
            display: block !important;
          }
          
          .warehouse-report-tabs .ant-tabs-nav {
            margin-bottom: 10px;
          }
          
          .warehouse-report-tabs .ant-tabs-tab:not(.ant-tabs-tab-active) {
            display: none;
          }
          
          .ant-card {
            box-shadow: none !important;
            border: 1px solid #eee !important;
          }
          
          .ant-layout-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          body {
            padding: 0;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default WarehouseReportsPage;
