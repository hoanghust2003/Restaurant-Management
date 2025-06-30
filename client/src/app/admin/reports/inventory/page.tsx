'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { 
  Card, 
  DatePicker, 
  Button, 
  Table, 
  Row, 
  Col, 
  Statistic, 
  Tag, 
  Space, 
  Divider, 
  Progress
} from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  FileExcelOutlined, 
  PrinterOutlined, 
  WarningOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { formatPrice } from '@/app/utils/format';
import moment from 'moment';

const { RangePicker } = DatePicker;

// Mô phỏng dữ liệu báo cáo kho
const generateInventoryMockData = () => {
  // Danh sách nguyên liệu sử dụng nhiều
  const mostUsedIngredients = [
    { id: '1', name: 'Thịt bò', quantity: 58, unit: 'kg', value: 8700000 },
    { id: '2', name: 'Cá hồi', quantity: 45, unit: 'kg', value: 6750000 },
    { id: '3', name: 'Tôm', quantity: 42, unit: 'kg', value: 5880000 },
    { id: '4', name: 'Thịt cừu', quantity: 36, unit: 'kg', value: 9000000 },
    { id: '5', name: 'Rau xà lách', quantity: 32, unit: 'kg', value: 3200000 }
  ];

  // Danh sách nguyên liệu sắp hết
  const lowStockItems = [
    { id: '1', name: 'Rượu vang đỏ', available: 5, minimum: 20, unit: 'chai' },
    { id: '2', name: 'Gia vị hỗn hợp', available: 3, minimum: 15, unit: 'gói' },
    { id: '3', name: 'Bột mỳ', available: 8, minimum: 30, unit: 'kg' },
    { id: '4', name: 'Dầu olive', available: 4, minimum: 12, unit: 'chai' }
  ];

  // Danh sách nguyên liệu sắp hết hạn
  const expiringItems = [
    { id: '1', name: 'Sữa tươi', batch: 'B123', expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), quantity: 12, unit: 'lít' },
    { id: '2', name: 'Thịt gà', batch: 'B456', expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), quantity: 8, unit: 'kg' },
    { id: '3', name: 'Phô mai', batch: 'B789', expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), quantity: 5, unit: 'kg' }
  ];

  // Dữ liệu biến động kho
  const stockMovement = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    const imports = Math.floor(Math.random() * 10) + 5;
    const exports = Math.floor(Math.random() * 8) + 3;
    const import_value = imports * 1500000;
    const export_value = exports * 1200000;
    
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      imports,
      exports,
      import_value,
      export_value
    };
  });

  // Tổng giá trị
  const totalImportValue = stockMovement.reduce((sum, item) => sum + item.import_value, 0);
  const totalExportValue = stockMovement.reduce((sum, item) => sum + item.export_value, 0);

  return {
    report_date: new Date().toISOString(),
    period: {
      start: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      end: moment().format('YYYY-MM-DD'),
    },
    summary: {
      total_ingredients: 126,
      total_suppliers: 15,
      total_imports: stockMovement.reduce((sum, item) => sum + item.imports, 0),
      total_exports: stockMovement.reduce((sum, item) => sum + item.exports, 0),
      total_import_value: totalImportValue,
      total_export_value: totalExportValue,
      current_value: 28540000
    },
    mostUsedIngredients,
    lowStockItems,
    expiringItems,
    stockMovement
  };
};

export default function InventoryReportPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(7, 'days'),
    moment()
  ]);
  const [reportData, setReportData] = useState(generateInventoryMockData());

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleGenerateReport = () => {
    setLoading(true);
    // Giả lập tạo báo cáo
    setTimeout(() => {
      setReportData(generateInventoryMockData());
      setLoading(false);
    }, 1000);
  };

  const handleExportExcel = () => {
    alert('Tính năng xuất Excel đang được phát triển');
  };

  const handlePrint = () => {
    window.print();
  };

  // Cột cho bảng nguyên liệu sử dụng nhiều nhất
  const ingredientsColumns: TableColumnsType<any> = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng sử dụng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: any) => `${quantity.toLocaleString('vi-VN')} ${record.unit}`,
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => formatPrice(value),
    }
  ];

  // Cột cho bảng nguyên liệu sắp hết
  const lowStockColumns: TableColumnsType<any> = [
    {
      title: 'Tên nguyên liệu',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Còn lại',
      dataIndex: 'available',
      key: 'available',
      render: (available: number, record: any) => (
        <div>
          <div className="font-medium text-red-500">
            {available.toLocaleString('vi-VN')} {record.unit}
          </div>
          <Progress 
            percent={Math.round((available / record.minimum) * 100)} 
            status="exception" 
            size="small" 
          />
        </div>
      ),
    },
    {
      title: 'Ngưỡng tối thiểu',
      dataIndex: 'minimum',
      key: 'minimum',
      render: (minimum: number, record: any) => `${minimum.toLocaleString('vi-VN')} ${record.unit}`,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: any) => {
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
  const expiringColumns: TableColumnsType<any> = [
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
      render: (_: any, record: any) => `${record.quantity.toLocaleString('vi-VN')} ${record.unit}`,
    }
  ];

  return (
    <AdminLayout title="Báo cáo kho">
      <Card className="print-friendly">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <RangePicker 
              value={dateRange as any}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              className="print-hidden"
            />
            <Button 
              type="primary" 
              onClick={handleGenerateReport} 
              loading={loading}
              icon={<ReloadOutlined />}
              className="print-hidden"
            >
              Tạo báo cáo
            </Button>
          </div>
          
          <Space className="print-hidden">
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              In báo cáo
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              Xuất Excel
            </Button>
          </Space>
        </div>

        <div className="print-visible text-center mb-6 hidden">
          <h1 className="text-2xl font-bold">BÁO CÁO KHO</h1>
          <p>Kỳ báo cáo: {moment(dateRange[0]).format('DD/MM/YYYY')} - {moment(dateRange[1]).format('DD/MM/YYYY')}</p>
          <p>Ngày xuất báo cáo: {moment().format('DD/MM/YYYY HH:mm')}</p>
        </div>

        <Row gutter={16} className="mb-8">
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tổng giá trị tồn kho hiện tại"
                value={reportData.summary.current_value}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tổng giá trị nhập kho"
                value={reportData.summary.total_import_value}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tổng giá trị xuất kho"
                value={reportData.summary.total_export_value}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowDownOutlined />}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Biến động kho theo ngày" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.stockMovement}>
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
          <Col xs={24} lg={12}>
            <Card title="Nguyên liệu sắp hết" className="mb-6">
              <Table 
                dataSource={reportData.lowStockItems} 
                columns={lowStockColumns} 
                pagination={false}
                rowKey="id"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Nguyên liệu sắp hết hạn" className="mb-6">
              <Table 
                dataSource={reportData.expiringItems} 
                columns={expiringColumns} 
                pagination={false}
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>

        <Card title="Top 5 nguyên liệu sử dụng nhiều nhất">
          <Table 
            dataSource={reportData.mostUsedIngredients} 
            columns={ingredientsColumns} 
            pagination={false}
            rowKey="id"
          />
        </Card>

        <style jsx global>{`
          @media print {
            .print-hidden {
              display: none !important;
            }
            .print-visible {
              display: block !important;
            }
            .ant-layout-header,
            .ant-layout-sider,
            .ant-table-pagination {
              display: none !important;
            }
          }
        `}</style>
      </Card>
    </AdminLayout>
  );
}
