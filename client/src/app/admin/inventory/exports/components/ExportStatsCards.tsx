'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert } from 'antd';
import { 
  ExportOutlined, 
  CalendarOutlined, 
  DollarOutlined
} from '@ant-design/icons';
import { exportService } from '@/app/services/warehouse.service';

interface ExportStats {
  totalExports: number;
  thisMonthExports: number;
  totalValue: number;
  thisMonthValue: number;
  averageValue: number;
  recentExports: any[];
}

const ExportStatsCards: React.FC = () => {
  const [stats, setStats] = useState<ExportStats>({
    totalExports: 0,
    thisMonthExports: 0,
    totalValue: 0,
    thisMonthValue: 0,
    averageValue: 0,
    recentExports: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExportStats();
  }, []);

  const fetchExportStats = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Fetch all exports
      const exports = await exportService.getAll();
      
      // Calculate statistics
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const thisMonthExports = exports.filter((exp: any) => 
        new Date(exp.export_date) >= startOfMonth
      );
      
      const totalValue = exports.reduce((sum: number, exp: any) => {
        if (exp.items && Array.isArray(exp.items)) {
          const exportValue = exp.items.reduce((itemSum: number, item: any) => 
            itemSum + ((item.unit_price || 0) * item.quantity), 0
          );
          return sum + exportValue;
        }
        return sum;
      }, 0);
      
      const thisMonthValue = thisMonthExports.reduce((sum: number, exp: any) => {
        if (exp.items && Array.isArray(exp.items)) {
          const exportValue = exp.items.reduce((itemSum: number, item: any) => 
            itemSum + ((item.unit_price || 0) * item.quantity), 0
          );
          return sum + exportValue;
        }
        return sum;
      }, 0);

      const averageValue = exports.length > 0 ? totalValue / exports.length : 0;

      setStats({
        totalExports: exports.length,
        thisMonthExports: thisMonthExports.length,
        totalValue,
        thisMonthValue,
        averageValue,
        recentExports: exports.slice(0, 5) // Recent 5 exports
      });
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching export stats:', err);
      setError('Không thể tải thống kê xuất kho');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        className="mb-6"
      />
    );
  }

  return (
    <Row gutter={[16, 16]} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Tổng phiếu xuất"
            value={stats.totalExports}
            prefix={<ExportOutlined />}
            valueStyle={{ color: '#1890ff' }}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Xuất tháng này"
            value={stats.thisMonthExports}
            prefix={<CalendarOutlined />}
            valueStyle={{ color: '#52c41a' }}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Tổng giá trị xuất"
            value={stats.totalValue}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#cf1322' }}
            formatter={(value: any) => `${(value as number).toLocaleString('vi-VN')} ₫`}
            loading={loading}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Giá trị TB mỗi phiếu"
            value={stats.averageValue}
            prefix={<DollarOutlined />}
            valueStyle={{ color: '#722ed1' }}
            formatter={(value: any) => `${(value as number).toLocaleString('vi-VN')} ₫`}
            loading={loading}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ExportStatsCards;
