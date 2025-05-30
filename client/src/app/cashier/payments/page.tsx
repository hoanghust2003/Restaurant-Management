'use client';

import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import CashierLayout from '@/app/layouts/CashierLayout';
import PaymentHistory from '@/app/components/payment/PaymentHistory';
import { paymentService } from '@/app/services/payment.service';
import { PaymentModel } from '@/app/models/payment.model';

const { TabPane } = Tabs;

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<PaymentModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPaymentHistory({
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
        status: selectedStatus
      });
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [dateRange, selectedStatus]);

  const handleSearch = (text: string) => {
    setSearchText(text.toLowerCase());
  };

  const filteredPayments = searchText
    ? payments.filter(payment => 
        payment.transaction_id?.toLowerCase().includes(searchText) ||
        payment.order?.code?.toLowerCase().includes(searchText) ||
        payment.order?.id?.toLowerCase().includes(searchText)
      )
    : payments;

  return (
    <CashierLayout title="Quản lý thanh toán">
      <div className="p-6">
        <Tabs defaultActiveKey="all">
          <TabPane tab="Tất cả" key="all">
            <PaymentHistory
              data={filteredPayments}
              loading={loading}
              onRefresh={fetchPayments}
              onDateRangeChange={setDateRange}
              onStatusChange={setSelectedStatus}
              onSearch={handleSearch}
            />
          </TabPane>
          <TabPane tab="Chờ thanh toán" key="pending">
            <PaymentHistory
              data={payments.filter(p => p.status === 'pending')}
              loading={loading}
              onRefresh={fetchPayments}
              onDateRangeChange={setDateRange}
              onStatusChange={setSelectedStatus}
              onSearch={handleSearch}
            />
          </TabPane>
          <TabPane tab="Đã hoàn thành" key="completed">
            <PaymentHistory
              data={payments.filter(p => p.status === 'completed')}
              loading={loading}
              onRefresh={fetchPayments}
              onDateRangeChange={setDateRange}
              onStatusChange={setSelectedStatus}
              onSearch={handleSearch}
            />
          </TabPane>
        </Tabs>
      </div>
    </CashierLayout>
  );
}
