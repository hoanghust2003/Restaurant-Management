'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { Card, DatePicker, Button, Table, Row, Col, Statistic, Space, Divider } from 'antd';
import type { TableColumnsType } from 'antd';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  DollarOutlined, FileExcelOutlined, PrinterOutlined, ShoppingOutlined, 
  ReloadOutlined
} from '@ant-design/icons';
import { formatPrice } from '@/app/utils/format';
import moment from 'moment';

const { RangePicker } = DatePicker;

// Các màu sắc cho biểu đồ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Mô phỏng dữ liệu báo cáo doanh thu
const generateSalesMockData = () => {
  // Tạo dữ liệu doanh thu theo ngày
  const dailyRevenue = Array(7).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return {
      date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: Math.floor(Math.random() * 15000000) + 5000000
    };
  });

  // Tạo dữ liệu phương thức thanh toán
  const paymentMethods = [
    { method: 'Tiền mặt', amount: 25680000, count: 45 },
    { method: 'Thẻ tín dụng', amount: 18450000, count: 25 },
    { method: 'Ví điện tử', amount: 12560000, count: 20 },
    { method: 'Chuyển khoản', amount: 8640000, count: 15 }
  ];

  // Tạo dữ liệu món ăn bán chạy
  const topSellingDishes = [
    { id: '1', name: 'Bò hầm rượu vang', quantity: 58, revenue: 8700000, image: '/images/bo-ham-ruou-vang.jpg' },
    { id: '2', name: 'Cá hồi áp chảo', quantity: 45, revenue: 6750000, image: '/images/ca-hoi-ap-chao.jpg' },
    { id: '3', name: 'Mì Ý hải sản', quantity: 42, revenue: 5880000, image: '/images/mi-y-hai-san.jpg' },
    { id: '4', name: 'Sườn cừu nướng', quantity: 36, revenue: 9000000, image: '/images/suon-cuu-nuong.jpg' },
    { id: '5', name: 'Salad trộn Hoàng Gia', quantity: 32, revenue: 3200000, image: '/images/salad-hoang-gia.jpg' }
  ];

  // Tạo dữ liệu doanh thu theo giờ
  const hourlySales = Array(12).fill(0).map((_, i) => {
    const hour = (10 + i) % 24;
    const formattedHour = `${hour}:00`;
    return {
      hour: formattedHour,
      sales: Math.floor(Math.random() * 20) + 5,
      revenue: (Math.floor(Math.random() * 200) + 100) * 10000
    };
  });

  const totalRevenue = dailyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = paymentMethods.reduce((sum, item) => sum + item.count, 0);

  return {
    report_date: new Date().toISOString(),
    period: {
      start: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      end: moment().format('YYYY-MM-DD'),
    },
    totalRevenue,
    totalOrders,
    averageOrderValue: Math.round(totalRevenue / totalOrders),
    dailyRevenue,
    paymentMethods,
    topSellingDishes,
    hourlySales
  };
};

export default function SalesReportPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    moment().subtract(7, 'days'),
    moment()
  ]);
  const [reportData, setReportData] = useState(generateSalesMockData());

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    }
  };

  const handleGenerateReport = () => {
    setLoading(true);
    // Giả lập tạo báo cáo
    setTimeout(() => {
      setReportData(generateSalesMockData());
      setLoading(false);
    }, 1000);
  };

  const handleExportExcel = () => {
    alert('Tính năng xuất Excel đang được phát triển');
  };

  const handlePrint = () => {
    window.print();
  };

  // Cột cho bảng phương thức thanh toán
  const paymentMethodColumns: TableColumnsType<any> = [
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
      render: (_: any, record: any) => {
        const percentage = (record.amount / reportData.totalRevenue * 100).toFixed(1);
        return `${percentage}%`;
      }
    }
  ];

  // Cột cho bảng món ăn bán chạy
  const topDishColumns: TableColumnsType<any> = [
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
    <AdminLayout title="Báo cáo doanh thu">
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
          <h1 className="text-2xl font-bold">BÁO CÁO DOANH THU NHÀ HÀNG</h1>
          <p>Kỳ báo cáo: {moment(dateRange[0]).format('DD/MM/YYYY')} - {moment(dateRange[1]).format('DD/MM/YYYY')}</p>
          <p>Ngày xuất báo cáo: {moment().format('DD/MM/YYYY HH:mm')}</p>
        </div>
        
        <Row gutter={16} className="mb-8">
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={reportData.totalRevenue}
                formatter={(value: any) => formatPrice(value as number)}
                prefix={<DollarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Số đơn hàng"
                value={reportData.totalOrders}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Giá trị trung bình/đơn"
                value={reportData.averageOrderValue}
                formatter={(value: any) => formatPrice(value as number)}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Biểu đồ doanh thu theo ngày" className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.dailyRevenue}>
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
          <Col xs={24} lg={12}>
            <Card title="Phương thức thanh toán">
              <Table 
                dataSource={reportData.paymentMethods} 
                columns={paymentMethodColumns} 
                pagination={false} 
                rowKey="method"
              />
              <Divider />
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={reportData.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="method"
                    label={(entry: any) => `${entry.method}: ${((entry.amount / reportData.totalRevenue) * 100).toFixed(0)}%`}
                  >
                    {reportData.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatPrice(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Doanh thu theo giờ">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.hourlySales}>
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
            dataSource={reportData.topSellingDishes} 
            columns={topDishColumns} 
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
