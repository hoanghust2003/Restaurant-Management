'use client';

import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tag, Input, Select, DatePicker, Modal, message, Row, Col, Card } from 'antd';
import CustomLink from '@/app/components/CustomLink';
import { useRouter } from 'next/navigation';
import { 
  SearchOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '@/app/contexts/AuthContext';
import { OrderModel } from '@/app/models/order.model';
import { formatPrice, formatDateTime } from '@/app/utils/format';
import { OrderStatus, orderStatusColors, orderStatusText, TableStatus } from '@/app/utils/enums';
import { orderService } from '@/app/services/order.service';
import { tableService } from '@/app/services/table.service';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { confirm } = Modal;
const { Search } = Input;

interface OrderListProps {
  orders: OrderModel[];
  loading?: boolean;
  onStatusChange?: () => void;
  showFilters?: boolean;
  filterDefaults?: {
    status?: OrderStatus;
    tableId?: string;
    dateRange?: [Date, Date];
  };
}

const OrderList: React.FC<OrderListProps> = ({
  orders,
  loading = false,
  onStatusChange,
  showFilters = true,
  filterDefaults = {}
}) => {
  const { hasRole } = useAuth();
  const router = useRouter();
  const canManageOrders = hasRole(['admin', 'staff']);
  const canCompleteOrders = hasRole(['admin', 'cashier']);
  const canCancelOrders = hasRole(['admin', 'staff']);
  
  const [filteredOrders, setFilteredOrders] = useState<OrderModel[]>(orders);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(filterDefaults.status);
  const [tableIdFilter, setTableIdFilter] = useState<string | undefined>(filterDefaults.tableId);
  const [dateRange, setDateRange] = useState<[Date, Date] | undefined>(filterDefaults.dateRange);
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  
  // Apply filters when orders or filter settings change
  useEffect(() => {
    applyFilters();
  }, [orders, searchText, statusFilter, tableIdFilter, dateRange]);

  // Apply all filters to the orders list
  const applyFilters = () => {
    let result = [...orders];
    
    // Filter by search text (code, table name)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(order => 
        (order.code?.toLowerCase().includes(searchLower)) || 
        (order.table?.name?.toLowerCase().includes(searchLower)) ||
        (order.id.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by status
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by table ID
    if (tableIdFilter) {
      result = result.filter(order => order.tableId === tableIdFilter);
    }
    
    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      result = result.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    setFilteredOrders(result);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchText('');
    setStatusFilter(undefined);
    setTableIdFilter(undefined);
    setDateRange(undefined);
  };
  
  // Handle order status change
  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    let confirmTitle = '';
    let confirmMessage = '';
    let tableAction = null;
    
    switch (status) {
      case OrderStatus.COMPLETED:
        confirmTitle = 'Xác nhận hoàn thành đơn hàng';
        confirmMessage = 'Bàn sẽ được cập nhật thành trạng thái "Đang dọn dẹp". Xác nhận hoàn thành đơn hàng này?';
        tableAction = TableStatus.CLEANING;
        break;
      case OrderStatus.CANCELED:
        confirmTitle = 'Xác nhận hủy đơn hàng';
        confirmMessage = 'Bạn có chắc chắn muốn hủy đơn hàng này?';
        break;
      default:
        confirmTitle = `Xác nhận đổi trạng thái`;
        confirmMessage = `Bạn có chắc chắn muốn đổi trạng thái đơn hàng thành "${orderStatusText[status]}"?`;
    }
    
    confirm({
      title: confirmTitle,
      content: confirmMessage,
      onOk: async () => {
        try {
          const order = await orderService.updateStatus(orderId, status);
          
          // If order is completed, update table status to CLEANING
          if (status === OrderStatus.COMPLETED && tableAction && order.tableId) {
            await tableService.updateStatus(order.tableId, tableAction);
          }
          
          message.success(`Đã cập nhật trạng thái đơn hàng thành ${orderStatusText[status]}`);
          
          if (onStatusChange) {
            onStatusChange();
          }
        } catch (error) {
          console.error('Error updating order status:', error);
          message.error('Không thể cập nhật trạng thái đơn hàng');
        }
      }
    });
  };

  const columns = [
    {      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record: OrderModel) => (
        <CustomLink href={`/orders/${record.id}`} className="text-blue-600 hover:text-blue-800">
          {text || record.id.substring(0, 8)}
        </CustomLink>
      ),
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'name'],
      key: 'table',
      render: (text: string, record: OrderModel) => (
        record.table?.name || `Bàn #${record.tableId.substring(0, 5)}`
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (total: number) => formatPrice(total),
      sorter: (a: OrderModel, b: OrderModel) => a.total_price - b.total_price,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={orderStatusColors[status]}>
          {orderStatusText[status]}
        </Tag>
      ),      filters: Object.values(OrderStatus).map(status => ({ 
        text: orderStatusText[status], 
        value: status 
      })),
      onFilter: (value: any, record: OrderModel) => record.status === value,
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
      sorter: (a: OrderModel, b: OrderModel) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
  ];

  // Add action column if user has permission
  if (canManageOrders) {
    columns.push({
      title: 'Thao tác',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: any, record: OrderModel) => (
        <Space>          <CustomLink href={`/orders/${record.id}`} passHref>
            <Button type="primary" size="small" icon={<EyeOutlined />}>
              Chi tiết
            </Button>
          </CustomLink>

          {canCompleteOrders && record.status !== OrderStatus.COMPLETED && record.status !== OrderStatus.CANCELED && (
            <Button
              type="default"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record.id, OrderStatus.COMPLETED)}
            >
              Hoàn thành
            </Button>
          )}

          {canCancelOrders && record.status !== OrderStatus.COMPLETED && record.status !== OrderStatus.CANCELED && (
            <Button
              danger
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleStatusChange(record.id, OrderStatus.CANCELED)}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    } as any);
  }

  return (
    <div className="order-list">
      {showFilters && (
        <Card className="mb-4" size="small">
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={8}>
              <Search
                placeholder="Tìm theo mã đơn, bàn..."
                allowClear
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: '100%' }}
                allowClear
                value={statusFilter}
                onChange={value => setStatusFilter(value)}
              >
                {Object.values(OrderStatus).map(status => (
                  <Option key={status} value={status}>
                    <Tag color={orderStatusColors[status]}>{orderStatusText[status]}</Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <RangePicker 
                style={{ width: '100%' }} 
                onChange={(dates) => {
                  setDateRange(dates as any);
                }} 
              />
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button 
                type="default" 
                icon={<ReloadOutlined />}
                onClick={resetFilters}
              >
                Đặt lại bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={loading || localLoading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
        }}
      />
    </div>
  );
};

export default OrderList;
