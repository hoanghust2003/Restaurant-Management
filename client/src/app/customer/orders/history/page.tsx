'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  Tag,
  Space,
  Button,
  Spin,
  Empty,
  message,
  DatePicker,
  Modal,
  Input,
  Rate
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import CustomerLayout from '@/app/layouts/CustomerLayout';
import { orderService } from '@/app/services/order.service';
import { OrderModel } from '@/app/models/order.model';
import { OrderStatus, orderStatusText, orderStatusColors } from '@/app/utils/enums';
import { formatPrice, formatDateTime } from '@/app/utils/format';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function CustomerOrderHistoryPage() {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [orderDetailModalVisible, setOrderDetailModalVisible] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<OrderModel | null>(null);

  // Load order history when page loads
  useEffect(() => {
    fetchOrderHistory();
  }, []);

  // Fetch completed and cancelled orders
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      
      // Only get completed and cancelled orders
      const filters = {
        status: `${OrderStatus.COMPLETED},${OrderStatus.CANCELED}`,
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined
      };
      
      // Add date range filter if selected
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }
      
      const data = await orderService.getAll(filters);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      message.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search text
  const getFilteredOrders = () => {
    if (!searchText) return orders;
    
    return orders.filter(order => 
      (order.code && order.code.toLowerCase().includes(searchText.toLowerCase())) ||
      (order.table?.name && order.table.name.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  // Handle viewing order details
  const handleViewOrderDetails = (order: OrderModel) => {
    setCurrentOrder(order);
    setOrderDetailModalVisible(true);
  };

  // Open feedback modal for a specific order
  const showFeedbackModal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setCurrentOrderId(orderId);
    
    // If order already has feedback, pre-fill the form
    if (order?.feedback) {
      setFeedbackText(order.feedback);
      //setFeedbackRating(order.rating); // Assuming there's a rating field
    } else {
      setFeedbackText('');
      setFeedbackRating(5);
    }
    
    setFeedbackModalVisible(true);
  };

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (!currentOrderId) return;
    
    try {
      setSubmitLoading(true);
      
      // Submit feedback to API
      await orderService.submitFeedback(currentOrderId, feedbackText, feedbackRating);
      
      message.success('Cảm ơn bạn đã gửi đánh giá!');
      setFeedbackModalVisible(false);
      
      // Refresh orders to update UI
      await fetchOrderHistory();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      message.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record: OrderModel) => (
        <a onClick={() => handleViewOrderDetails(record)}>
          {text || record.id.substring(0, 8)}
        </a>
      ),
    },
    {
      title: 'Thời gian đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
      sorter: (a: OrderModel, b: OrderModel) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Bàn',
      dataIndex: ['table', 'name'],
      key: 'table',
      render: (text: string, record: OrderModel) => text || `Bàn #${record.tableId.substring(0, 5)}`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price: number) => formatPrice(price),
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
      ),
      filters: [
        { text: orderStatusText[OrderStatus.COMPLETED], value: OrderStatus.COMPLETED },
        { text: orderStatusText[OrderStatus.CANCELED], value: OrderStatus.CANCELED }
      ],
      onFilter: (value: any, record: OrderModel) => record.status === value,
    },
    {
      title: 'Đánh giá',
      key: 'feedback',
      render: (text: string, record: OrderModel) => (
        <Space>
          {record.feedback ? (
            <Tag color="green">Đã đánh giá</Tag>
          ) : record.status === OrderStatus.COMPLETED ? (
            <Button 
              size="small"
              onClick={() => showFeedbackModal(record.id)}
            >
              Đánh giá
            </Button>
          ) : (
            <Text type="secondary">N/A</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (text: string, record: OrderModel) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewOrderDetails(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <CustomerLayout>
      <div className="p-6">
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Title level={2} className="m-0">Lịch sử đơn hàng</Title>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrderHistory}
              loading={loading}
            >
              Làm mới
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Input
              placeholder="Tìm kiếm theo mã đơn, bàn..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 300 }}
            />
            
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0].toDate(), dates[1].toDate()]);
                } else {
                  setDateRange(null);
                }
              }}
              style={{ maxWidth: 400 }}
            />
            
            <Button
              type="primary"
              onClick={fetchOrderHistory}
            >
              Lọc
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Spin size="large" tip="Đang tải lịch sử đơn hàng..." />
            </div>
          ) : getFilteredOrders().length > 0 ? (
            <Table
              dataSource={getFilteredOrders()}
              columns={columns}
              rowKey="id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_DEFAULT}
              description="Không tìm thấy đơn hàng nào trong lịch sử"
            >
              <Button type="primary" href="/customer/menu" icon={<HistoryOutlined />}>
                Đặt món ngay
              </Button>
            </Empty>
          )}
        </Card>
        
        {/* Feedback Modal */}
        <Modal
          title="Đánh giá đơn hàng"
          visible={feedbackModalVisible}
          onCancel={() => setFeedbackModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setFeedbackModalVisible(false)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={submitLoading}
              onClick={handleSubmitFeedback}
            >
              Gửi đánh giá
            </Button>
          ]}
        >
          <div className="mb-4">
            <Text>Xin hãy đánh giá chất lượng món ăn và dịch vụ:</Text>
            <div className="my-2">
              <Rate
                allowHalf
                value={feedbackRating}
                onChange={(value) => setFeedbackRating(value)}
              />
            </div>
          </div>
          
          <TextArea
            rows={4}
            placeholder="Nhập nhận xét của bạn về món ăn và dịch vụ..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </Modal>
        
        {/* Order Detail Modal */}
        <Modal
          title={`Chi tiết đơn hàng #${currentOrder?.code || (currentOrder?.id && currentOrder.id.substring(0, 8))}`}
          visible={orderDetailModalVisible}
          onCancel={() => setOrderDetailModalVisible(false)}
          width={700}
          footer={[
            <Button key="close" onClick={() => setOrderDetailModalVisible(false)}>
              Đóng
            </Button>
          ]}
        >
          {currentOrder && (
            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <Text>Trạng thái:</Text>
                  <Tag color={orderStatusColors[currentOrder.status]}>
                    {orderStatusText[currentOrder.status]}
                  </Tag>
                </div>
                <div className="flex justify-between mb-2">
                  <Text>Thời gian đặt:</Text>
                  <Text>{formatDateTime(currentOrder.created_at)}</Text>
                </div>
                <div className="flex justify-between mb-2">
                  <Text>Bàn:</Text>
                  <Text>{currentOrder.table?.name || `Bàn #${currentOrder.tableId}`}</Text>
                </div>
              </div>
              
              <Title level={5}>Danh sách món</Title>
              <Table
                dataSource={currentOrder.items || []}
                columns={[
                  {
                    title: 'Món ăn',
                    dataIndex: ['dish', 'name'],
                    key: 'name',
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 100,
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: ['dish', 'price'],
                    key: 'price',
                    width: 100,
                    render: (price: number) => formatPrice(price)
                  },
                  {
                    title: 'Thành tiền',
                    key: 'total',
                    width: 120,
                    render: (_, record) => formatPrice((record.dish?.price || 0) * record.quantity)
                  }
                ]}
                pagination={false}
                rowKey="id"
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>Tổng tiền</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong className="text-red-500">
                        {formatPrice(currentOrder.total_price)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
              
              {currentOrder.feedback && (
                <div className="mt-4">
                  <Title level={5}>Đánh giá của bạn</Title>
                  <Rate disabled value={5} /> {/* Replace with actual rating */}
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    {currentOrder.feedback}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </CustomerLayout>
  );
}
