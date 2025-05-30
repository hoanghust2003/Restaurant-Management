'use client';

import React, { useState } from 'react';
import AdminLayout from '@/app/layouts/AdminLayout';
import { Card, Tabs, DatePicker, Button, Table, Row, Col, Statistic } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportService } from '@/app/services/report.service';
import { formatPrice } from '@/app/utils/format';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
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

  const renderSalesReport = () => {
    if (!reportData) return null;

    return (
      <>
        <Row gutter={16} className="mb-8">
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={reportData.totalRevenue}
                formatter={value => formatPrice(value as number)}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Số đơn hàng"
                value={reportData.totalOrders}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Giá trị trung bình/đơn"
                value={reportData.averageOrderValue}
                formatter={value => formatPrice(value as number)}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Biểu đồ doanh thu">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
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
      children: 'Coming soon...',
    },
    {
      key: 'dishes',
      label: 'Món ăn phổ biến',
      children: 'Coming soon...',
    },
  ];

  return (
    <AdminLayout title="Báo cáo & Thống kê">
      <Card>
        <div className="mb-4 flex items-center space-x-4">
          <RangePicker onChange={handleDateRangeChange} />
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
