'use client';

import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  DatePicker,
  Input,
  Select,
  Button,
  Empty,
  Spin,
  Modal,
  Descriptions
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  WalletOutlined
} from '@ant-design/icons';
import { formatDateTime, formatPrice } from '@/app/utils/format';
import { PaymentModel } from '@/app/models/payment.model';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export interface PaymentHistoryProps {
  data: PaymentModel[];
  loading: boolean;
  onRefresh: () => void;
  onDateRangeChange: (dates: [Date, Date] | null) => void;
  onStatusChange: (status: string | undefined) => void;
  onSearch: (text: string) => void;
}

export const paymentStatusColors: Record<string, string> = {
  'pending': 'gold',
  'processing': 'processing',
  'completed': 'success',
  'failed': 'error',
  'refunded': 'warning'
};

export const paymentStatusText: Record<string, string> = {
  'pending': 'Chờ thanh toán',
  'processing': 'Đang xử lý',
  'completed': 'Đã thanh toán',
  'failed': 'Thất bại',
  'refunded': 'Đã hoàn tiền'
};

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  data,
  loading,
  onRefresh,
  onDateRangeChange,
  onStatusChange,
  onSearch
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentModel | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const handleViewDetails = (record: PaymentModel) => {
    setSelectedPayment(record);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: ['order', 'code'],
      key: 'order_code',
      render: (text: string, record: PaymentModel) => 
        text || record.order?.id?.substring(0, 8) || 'N/A',
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => method === 'vnpay' ? 'VNPay' : 'Tiền mặt',
      filters: [
        { text: 'VNPay', value: 'vnpay' },
        { text: 'Tiền mặt', value: 'cash' },
      ],
      onFilter: (value: boolean | React.Key, record: PaymentModel) => record.method === value,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatPrice(amount),
      sorter: (a: PaymentModel, b: PaymentModel) => a.amount - b.amount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={paymentStatusColors[status]}>
          {paymentStatusText[status]}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
      sorter: (a: PaymentModel, b: PaymentModel) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: PaymentModel) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={2} className="m-0">Lịch sử thanh toán</Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Tìm kiếm theo mã giao dịch, mã đơn..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              onSearch(e.target.value);
            }}
            style={{ maxWidth: 300 }}
          />
          
          <RangePicker
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                onDateRangeChange([dates[0].toDate(), dates[1].toDate()]);
              } else {
                onDateRangeChange(null);
              }
            }}
            style={{ maxWidth: 400 }}
          />
          
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ minWidth: 200 }}
            onChange={onStatusChange}
          >
            {Object.entries(paymentStatusText).map(([value, text]) => (
              <Option key={value} value={value}>{text}</Option>
            ))}
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spin size="large" tip="Đang tải lịch sử thanh toán..." />
          </div>
        ) : data.length > 0 ? (
          <Table
            columns={columns}
            dataSource={data}
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
            description="Không có giao dịch nào"
          />
        )}
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <WalletOutlined />
            <span>Chi tiết thanh toán</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedPayment && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mã giao dịch">
                {selectedPayment.transaction_id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">
                {selectedPayment.order?.code || selectedPayment.order?.id?.substring(0, 8) || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức">
                {selectedPayment.method === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền">
                <Text type="danger">{formatPrice(selectedPayment.amount)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={paymentStatusColors[selectedPayment.status]}>
                  {paymentStatusText[selectedPayment.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian tạo">
                {formatDateTime(selectedPayment.created_at)}
              </Descriptions.Item>
              {selectedPayment.completed_at && (
                <Descriptions.Item label="Thời gian hoàn thành">
                  {formatDateTime(selectedPayment.completed_at)}
                </Descriptions.Item>
              )}
              {selectedPayment.error && (
                <Descriptions.Item label="Lỗi">
                  <Text type="danger">{selectedPayment.error}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedPayment.metadata && (
              <div className="mt-4">
                <Title level={5}>Thông tin bổ sung</Title>
                <pre className="bg-gray-50 p-4 rounded overflow-auto">
                  {JSON.stringify(selectedPayment.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default PaymentHistory;
