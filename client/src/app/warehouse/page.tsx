'use client';

import React, { useState, useEffect } from 'react';
import { Spin, Card, Row, Col, Statistic, List, Table, Button, Tag, Alert, Typography } from 'antd';
import {
  AlertOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { warehouseService } from '@/app/services/warehouse.service';
import { WarehouseStats } from '@/app/models/warehouse.model';
import Link from 'next/link';

const { Title, Text } = Typography;

const WarehouseDashboard: React.FC = () => {
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [expiringItems, setExpiringItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch dashboard stats using mock data
        try {
          const statsData = await warehouseService.getStats();
          setStats(statsData);
        } catch (error) {
          console.error('Error fetching stats:', error);
          // Provide default stats if the API fails
          setStats({
            total_ingredients: 0,
            low_stock_count: 0,
            expiring_soon_count: 0,
            expired_count: 0,
            total_value: 0,
            recent_imports: 0,
            recent_exports: 0
          });
        }

        // Fetch low stock items
        try {
          const lowStockData = await warehouseService.getLowStockItems();
          setLowStockItems(lowStockData);
        } catch (error) {
          console.error('Error fetching low stock items:', error);
          setLowStockItems([]);
        }

        // Fetch expiring items
        try {
          const expiringData = await warehouseService.getExpiringItems();
          setExpiringItems(expiringData);
        } catch (error) {
          console.error('Error fetching expiring items:', error);
          setExpiringItems([]);
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching warehouse data:', err);
        setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);// Display loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // Display error state
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
    <div className="p-6">
      <div className="mb-6">
        <Title level={3}>Tổng quan kho hàng</Title>
        <Text className="text-gray-500">Thông tin tổng hợp về tình trạng kho</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số nguyên liệu"
              value={stats?.total_ingredients || 0}
              prefix={<InboxOutlined />}
            />
            <div className="mt-2">
              <Link href="/warehouse/ingredients">
                <Button type="link" size="small">Xem chi tiết</Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Nguyên liệu sắp hết"
              value={stats?.low_stock_count || 0}
              valueStyle={{ color: stats?.low_stock_count ? '#cf1322' : undefined }}
              prefix={<AlertOutlined />}
            />
            <div className="mt-2">              <Link href="/warehouse/reports">
                <Button type="link" size="small">Xem chi tiết</Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Sắp hết hạn"
              value={stats?.expiring_soon_count || 0}
              valueStyle={{ color: stats?.expiring_soon_count ? '#fa8c16' : undefined }}
              prefix={<ClockCircleOutlined />}
            />
            <div className="mt-2">              <Link href="/warehouse/reports">
                <Button type="link" size="small">Xem chi tiết</Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng giá trị kho"
              value={stats?.total_value || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="VND"
            />
            <div className="mt-2">              <Link href="/warehouse/reports">
                <Button type="link" size="small">Xem báo cáo</Button>
              </Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={12}>
          <Card>
            <Statistic
              title="Nhập kho (30 ngày qua)"
              value={stats?.recent_imports || 0}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="mt-2">
              <Link href="/warehouse/imports">
                <Button type="link" size="small">Xem nhập kho</Button>
              </Link>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={12}>
          <Card>
            <Statistic
              title="Xuất kho (30 ngày qua)"
              value={stats?.recent_exports || 0}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2">
              <Link href="/warehouse/exports">
                <Button type="link" size="small">Xem xuất kho</Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Alert Cards */}
      <Row gutter={[16, 16]}>
        {/* Low Stock Items */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <ExclamationCircleOutlined style={{ color: '#cf1322', marginRight: '8px' }} />
                <span>Nguyên liệu sắp hết</span>
              </div>
            }
            extra={<Link href="/warehouse/reports">Xem tất cả</Link>}
          >
            {lowStockItems.length > 0 ? (
              <List
                dataSource={lowStockItems.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Link key="import" href={`/warehouse/imports/create?ingredient=${item.id}`}>
                        <Button size="small" type="primary">Nhập thêm</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      title={<Link href={`/warehouse/ingredients/${item.id}`}>{item.name}</Link>}
                      description={`Số lượng: ${item.current_quantity} ${item.unit} (Ngưỡng: ${item.threshold} ${item.unit})`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-4">
                <Text type="secondary">Không có nguyên liệu nào sắp hết</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Expiring Items */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <ClockCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                <span>Nguyên liệu sắp hết hạn</span>
              </div>
            }
            extra={<Link href="/warehouse/reports">Xem tất cả</Link>}
          >
            {expiringItems.length > 0 ? (
              <List
                dataSource={expiringItems.slice(0, 5)}
                renderItem={(item) => (
                  <List.Item
                    key={item.batch_id}
                    actions={[
                      <Link key="view" href={`/warehouse/batches/${item.batch_id}`}>
                        <Button size="small">Chi tiết</Button>
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      title={<Link href={`/warehouse/ingredients/${item.ingredient_id}`}>{item.ingredient_name}</Link>}
                      description={`Lô: ${item.lot_number || 'N/A'} - Hạn sử dụng: ${new Date(item.expiry_date).toLocaleDateString()}`}
                    />
                    <div>
                      <Tag color="orange">Còn {item.days_until_expiry} ngày</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-4">
                <Text type="secondary">Không có nguyên liệu nào sắp hết hạn</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="mt-6">
        <Title level={4}>Hành động nhanh</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Link href="/warehouse/imports/create">
              <Button icon={<ShoppingCartOutlined />} type="primary" size="large" block>
                Tạo phiếu nhập mới
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Link href="/warehouse/exports/create">
              <Button icon={<ArrowUpOutlined />} size="large" block>
                Tạo phiếu xuất mới
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>            <Link href="/warehouse/reports">
              <Button icon={<InboxOutlined />} size="large" block>
                Báo cáo tồn kho
              </Button>
            </Link>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Link href="/warehouse/ingredients/create">
              <Button icon={<PlusOutlined />} size="large" block>
                Thêm nguyên liệu mới
              </Button>
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
