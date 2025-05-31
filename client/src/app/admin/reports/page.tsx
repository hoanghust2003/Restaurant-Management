'use client';

import React, { useState } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { Card, Tabs, DatePicker, Button, Table, Row, Col, Statistic, Tag, Space, List, Divider } from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, FileExcelOutlined, 
  PrinterOutlined, ShoppingOutlined, WarningOutlined
} from '@ant-design/icons';
import { reportService } from '@/app/services/report.service';
import { formatPrice } from '@/app/utils/format';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Các màu sắc cho biểu đồ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface PaymentMethod {
  method: string;
  amount: number;
  count: number;
}

interface TopDish {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  image?: string;
}

interface HourlySale {
  hour: string;
  sales: number;
  revenue: number;
}

interface SalesReportData {
  report_date: string;
  period: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
  paymentMethods: PaymentMethod[];
  topSellingDishes: TopDish[];
  hourlySales: HourlySale[];
}

interface LowStockItem {
  id: string;
  name: string;
  available: number;
  minimum: number;
  unit: string;
}

interface ExpiringItem {
  id: string;
  name: string;
  batch: string;
  expiry_date: Date;
  quantity: number;
  unit: string;
}

interface UsedIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  value: number;
}

interface StockMovement {
  date: string;
  imports: number;
  exports: number;
  import_value: number;
  export_value: number;
}

interface InventoryReportData {
  report_date: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_ingredients: number;
    total_suppliers: number;
    total_imports: number;
    total_exports: number;
    total_import_value: number;
    total_export_value: number;
    current_value: number;
  };
  mostUsedIngredients: UsedIngredient[];
  lowStockItems: LowStockItem[];
  expiringItems: ExpiringItem[];
  stockMovement: StockMovement[];
}

interface CategorySale {
  category: string;
  quantity: number;
  revenue: number;
}

interface TimeSlotSale {
  time: string;
  quantity: number;
  revenue: number;
}

interface DishesReportData {
  report_date: string;
  period: {
    start: string;
    end: string;
  };
  totalDishes: number;
  dishesOrdered: number;
  topDishes: TopDish[];
  categorySales: CategorySale[];
  salesByTime: TimeSlotSale[];
}

type ReportData = SalesReportData | InventoryReportData | DishesReportData;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  // Set mặc định cho date range là 30 ngày
  React.useEffect(() => {
    const defaultEndDate = dayjs();
    const defaultStartDate = dayjs().subtract(30, 'day');
    setDateRange([defaultStartDate, defaultEndDate]);
  }, []);

  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates);
  };

  const handleGenerateReport = async () => {
    if (!dateRange) return;

    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      let data;

      switch (activeTab) {
        case 'sales':
          data = await reportService.getSalesReport(startDate.toISOString(), endDate.toISOString());
          break;
        case 'inventory':
          data = await reportService.getInventoryReport(startDate.toISOString(), endDate.toISOString());
          break;
        case 'dishes':
          data = await reportService.getPopularDishesReport(startDate.toISOString(), endDate.toISOString());
          break;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tạo báo cáo khi component được mount hoặc chuyển tab
  React.useEffect(() => {
    if (dateRange) {
      handleGenerateReport();
    }
  }, [dateRange, activeTab]);

  const renderSalesReport = () => {
    if (!reportData) return null;
    
    // Đảm bảo reportData là SalesReportData
    const salesData = reportData as SalesReportData;

    // Bảng phương thức thanh toán
    const paymentMethodColumns: TableColumnsType<PaymentMethod> = [
      {
        title: 'Phương thức',
        dataIndex: 'method',
        key: 'method',
      },
      {
        title: 'Số lượng',
        dataIndex: 'count',
        key: 'count',
        render: (count: number) => count.toLocaleString('vi-VN'),
      },
      {
        title: 'Giá trị',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount: number) => formatPrice(amount),
      },
      {
        title: 'Tỷ lệ',
        key: 'percentage',
        render: (_: any, record: PaymentMethod) => {
          const percentage = (record.amount / salesData.totalRevenue * 100).toFixed(1);
          return `${percentage}%`;
        }
      }
    ];

    // Bảng món ăn bán chạy
    const topDishColumns: TableColumnsType<TopDish> = [
      {
        title: 'Tên món',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (quantity: number) => quantity.toLocaleString('vi-VN'),
      },
      {
        title: 'Doanh thu',
        dataIndex: 'revenue',
        key: 'revenue',
        render: (revenue: number) => formatPrice(revenue),
      }
    ];

    return (
      <>
        <div className="flex justify-end space-x-2 mb-4">
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In báo cáo
          </Button>
          <Button icon={<FileExcelOutlined />} type="primary">
            Xuất Excel
          </Button>
        </div>
        
        <Row gutter={16} className="mb-8">
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={salesData.totalRevenue}
                formatter={(value: any) => formatPrice(value as number)}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Số đơn hàng"
                value={salesData.totalOrders}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Giá trị trung bình/đơn"
                value={salesData.averageOrderValue}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Biểu đồ doanh thu theo ngày" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={salesData.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatPrice(value as number)} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Row gutter={16} className="mb-6">
          <Col span={12}>
            <Card title="Phương thức thanh toán">
              <Table 
                dataSource={salesData.paymentMethods} 
                columns={paymentMethodColumns} 
                pagination={false} 
                rowKey="method"
              />
              <Divider />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={salesData.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="method"
                    label={(entry: any) => `${entry.method}: ${((entry.amount / salesData.totalRevenue) * 100).toFixed(0)}%`}
                  >
                    {salesData.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatPrice(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Doanh thu theo giờ">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData.hourlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value: any, name: any) => {
                    if (name === 'revenue') return formatPrice(value as number);
                    return value;
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sales" name="Số đơn" stroke="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Card title="Top 5 món ăn bán chạy nhất" className="mb-6">
          <Table 
            dataSource={salesData.topSellingDishes} 
            columns={topDishColumns} 
            pagination={false}
            rowKey="id"
          />
        </Card>
      </>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData) return null;
    
    // Đảm bảo reportData là InventoryReportData
    const inventoryData = reportData as InventoryReportData;
    
    // Cột cho bảng nguyên liệu sử dụng nhiều nhất
    const ingredientsColumns: TableColumnsType<UsedIngredient> = [
      {
        title: 'Tên nguyên liệu',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số lượng sử dụng',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (quantity: number, record: UsedIngredient) => `${quantity.toLocaleString('vi-VN')} ${record.unit}`,
      },
      {
        title: 'Giá trị',
        dataIndex: 'value',
        key: 'value',
        render: (value: number) => formatPrice(value),
      },
    ];

    // Cột cho bảng nguyên liệu sắp hết
    const lowStockColumns: TableColumnsType<LowStockItem> = [
      {
        title: 'Tên nguyên liệu',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Còn lại',
        dataIndex: 'available',
        key: 'available',
        render: (available: number, record: LowStockItem) => `${available.toLocaleString('vi-VN')} ${record.unit}`,
      },
      {
        title: 'Ngưỡng tối thiểu',
        dataIndex: 'minimum',
        key: 'minimum',
        render: (minimum: number, record: LowStockItem) => `${minimum.toLocaleString('vi-VN')} ${record.unit}`,
      },
      {
        title: 'Trạng thái',
        key: 'status',
        render: (_: any, record: LowStockItem) => {
          const percentage = (record.available / record.minimum) * 100;
          return (
            <Tag color={percentage < 30 ? 'error' : 'warning'} icon={<WarningOutlined />}>
              {percentage < 30 ? 'Khẩn cấp' : 'Sắp hết'}
            </Tag>
          );
        }
      }
    ];

    // Cột cho bảng nguyên liệu sắp hết hạn
    const expiringColumns: TableColumnsType<ExpiringItem> = [
      {
        title: 'Tên nguyên liệu',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Mã lô',
        dataIndex: 'batch',
        key: 'batch',
      },
      {
        title: 'Ngày hết hạn',
        dataIndex: 'expiry_date',
        key: 'expiry_date',
        render: (date: Date) => new Date(date).toLocaleDateString('vi-VN'),
      },
      {
        title: 'Số lượng',
        key: 'quantity',
        render: (_: any, record: ExpiringItem) => `${record.quantity.toLocaleString('vi-VN')} ${record.unit}`,
      }
    ];

    return (
      <>
        <div className="flex justify-end space-x-2 mb-4">
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In báo cáo
          </Button>
          <Button icon={<FileExcelOutlined />} type="primary">
            Xuất Excel
          </Button>
        </div>
        
        <Row gutter={16} className="mb-8">
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng giá trị tồn kho hiện tại"
                value={inventoryData.summary.current_value}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng giá trị nhập kho"
                value={inventoryData.summary.total_import_value}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng giá trị xuất kho"
                value={inventoryData.summary.total_export_value}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowDownOutlined />}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Biến động kho theo ngày" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={inventoryData.stockMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: any, name: any) => {
                if (name === 'import_value' || name === 'export_value') {
                  return formatPrice(value as number);
                }
                return value;
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="imports" name="Số lượt nhập" fill="#82ca9d" />
              <Bar yAxisId="left" dataKey="exports" name="Số lượt xuất" fill="#ff8042" />
              <Bar yAxisId="right" dataKey="import_value" name="Giá trị nhập" fill="#0088FE" />
              <Bar yAxisId="right" dataKey="export_value" name="Giá trị xuất" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Row gutter={16} className="mb-6">
          <Col span={12}>
            <Card title="Nguyên liệu sắp hết" className="mb-6">
              <Table 
                dataSource={inventoryData.lowStockItems} 
                columns={lowStockColumns} 
                pagination={false}
                rowKey="id"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Nguyên liệu sắp hết hạn" className="mb-6">
              <Table 
                dataSource={inventoryData.expiringItems} 
                columns={expiringColumns} 
                pagination={false}
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>

        <Card title="Top 5 nguyên liệu sử dụng nhiều nhất">
          <Table 
            dataSource={inventoryData.mostUsedIngredients} 
            columns={ingredientsColumns} 
            pagination={false}
            rowKey="id"
          />
        </Card>
      </>
    );
  };

  const renderPopularDishesReport = () => {
    if (!reportData) return null;

    // Đảm bảo reportData là DishesReportData
    const dishesData = reportData as DishesReportData;

    // Cột cho bảng món ăn phổ biến
    const topDishColumns: TableColumnsType<TopDish> = [
      {
        title: 'Tên món',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (quantity: number) => quantity.toLocaleString('vi-VN'),
      },
      {
        title: 'Doanh thu',
        dataIndex: 'revenue',
        key: 'revenue',
        render: (revenue: number) => formatPrice(revenue),
      }
    ];

    // Cột cho bảng danh mục bán chạy
    const categoryColumns: TableColumnsType<CategorySale> = [
      {
        title: 'Danh mục',
        dataIndex: 'category',
        key: 'category',
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        render: (quantity: number) => quantity.toLocaleString('vi-VN'),
      },
      {
        title: 'Doanh thu',
        dataIndex: 'revenue',
        key: 'revenue',
        render: (revenue: number) => formatPrice(revenue),
      }
    ];

    return (
      <>
        <div className="flex justify-end space-x-2 mb-4">
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In báo cáo
          </Button>
          <Button icon={<FileExcelOutlined />} type="primary">
            Xuất Excel
          </Button>
        </div>
        
        <Row gutter={16} className="mb-8">
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số món trong thực đơn"
                value={dishesData.totalDishes}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Số món đã được gọi"
                value={dishesData.dishesOrdered}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tỷ lệ thực đơn được sử dụng"
                value={(dishesData.dishesOrdered / dishesData.totalDishes * 100).toFixed(1)}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16} className="mb-6">
          <Col span={24}>
            <Card title="Top 10 món ăn bán chạy nhất">
              <Table 
                dataSource={dishesData.topDishes} 
                columns={topDishColumns} 
                pagination={false}
                rowKey="id"
              />
              <Divider />
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dishesData.topDishes.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: any, name: any) => {
                    if (name === 'revenue') return formatPrice(value as number);
                    return value;
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="quantity" name="Số lượng" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="revenue" name="Doanh thu" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} className="mb-6">
          <Col span={12}>
            <Card title="Doanh thu theo danh mục">
              <Table 
                dataSource={dishesData.categorySales} 
                columns={categoryColumns} 
                pagination={false}
                rowKey="category"
              />
              <Divider />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dishesData.categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                    nameKey="category"
                    label={(entry: any) => `${entry.category}: ${((entry.revenue / dishesData.categorySales.reduce((sum: number, item: any) => sum + item.revenue, 0)) * 100).toFixed(0)}%`}
                  >
                    {dishesData.categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatPrice(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Doanh thu theo khung giờ">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dishesData.salesByTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value: any, name: any) => {
                    if (name === 'revenue') return formatPrice(value as number);
                    return value;
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="quantity" name="Số lượng" stroke="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </>
    );
  };

  const items = [
    {
      key: 'sales',
      label: 'Báo cáo doanh thu',
      children: renderSalesReport(),
    },
    {
      key: 'inventory',
      label: 'Báo cáo kho',
      children: renderInventoryReport(),
    },
    {
      key: 'dishes',
      label: 'Món ăn phổ biến',
      children: renderPopularDishesReport(),
    },
  ];

  return (
    <AdminLayout title="Báo cáo & Thống kê">
      <Card>
        <div className="mb-4 flex items-center space-x-4">
          <RangePicker 
            onChange={handleDateRangeChange} 
            value={dateRange}
          />
          <Button 
            type="primary" 
            onClick={handleGenerateReport} 
            loading={loading}
            disabled={!dateRange}
          >
            Tạo báo cáo
          </Button>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={items}
        />
      </Card>
    </AdminLayout>
  );
}
