'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import WaiterLayout from '@/app/layouts/WaiterLayout';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usePerformanceMonitor } from '@/app/utils/performanceMonitoring';
import { prefetchWaiterDashboardData } from '@/app/utils/prefetch';
import QrCodeModal from '@/app/components/QrCodeModal';
import { 
  Button, 
  Select, 
  Modal, 
  Form, 
  message, 
  Spin 
} from 'antd';
import axios from '../../utils/axios';
import { TableStatus } from '@/app/utils/enums';
import { withRetry } from '@/app/utils/apiRetry';

// Dynamically import components for code splitting
const TablesGrid = dynamic(() => import('@/app/components/TablesGrid'), {
  loading: () => <div className="flex justify-center items-center h-64"><Spin size="large" /></div>,
  // Add SSR false for better client-side performance (since this is a dashboard component)
  ssr: false
});

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: string;
}

const statusOptions = [
  { value: TableStatus.AVAILABLE, label: 'Trống' },
  { value: TableStatus.OCCUPIED, label: 'Đang sử dụng' },
  { value: TableStatus.RESERVED, label: 'Đã đặt trước' },
  { value: TableStatus.CLEANING, label: 'Đang dọn dẹp' },
];

const statusColors = {
  [TableStatus.AVAILABLE]: 'success',
  [TableStatus.OCCUPIED]: 'error',
  [TableStatus.RESERVED]: 'warning',
  [TableStatus.CLEANING]: 'processing',
};

export default function WaiterTablesPage() {
  const { user, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableData | null>(null);
  const [form] = Form.useForm();
  
  // Monitor component performance
  usePerformanceMonitor('WaiterTablesPage', [tables, loading, statusFilter]);
  
  // Prefetch critical data for the waiter dashboard
  useEffect(() => {
    // Only prefetch when the user is authenticated and on the staff dashboard
    if (user && hasRole(['staff'])) {
      prefetchWaiterDashboardData();
    }
  }, [user, hasRole]);
  
  // Check if user has permission to view this page  
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect unauthenticated users to login
        router.push('/auth/login');
      } else if (!hasRole(['staff'])) {
        // Redirect unauthorized users to home
        router.push('/');
        message.error('Bạn không có quyền truy cập trang này');
      }
    }
  }, [user, authLoading, hasRole, router]);
  // Fetch tables data
  // Sử dụng useCallback để tránh tạo lại function mỗi lần render
  const fetchTablesData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    // Track fetch start time for metrics
    const fetchStartTime = performance.now();
    
    try {
      // Check cache first
      const url = statusFilter 
        ? `/tables?status=${statusFilter}` 
        : '/tables';
        
      // First attempt - use cache if available (don't set loading indicator)
      const response = await withRetry(() => axios.get(url));
        // Check if response came from cache
      if ((response as any).cached) {
        setTables(response.data);
        setLoading(false);
        
        // Refresh in background only if the data is older than 30 seconds
        // This prevents excessive API calls while maintaining data freshness
        const refreshDelay = 100; // Short delay before refresh
        const now = Date.now();
        const lastRefreshTimeKey = `last_refresh_${url}`;
        const lastRefreshTime = localStorage.getItem(lastRefreshTimeKey) 
          ? parseInt(localStorage.getItem(lastRefreshTimeKey) || '0', 10)
          : 0;
          
        const timeSinceLastRefresh = now - lastRefreshTime;
        
        if (timeSinceLastRefresh > 30000) { // Only refresh if it's been 30+ seconds
          setTimeout(() => {
            axios.get(url, { 
              headers: { 'x-skip-cache': 'true' } 
            }).then(freshResponse => {
              setTables(freshResponse.data);
              localStorage.setItem(lastRefreshTimeKey, now.toString());
            }).catch(err => {
              // Silently fail for background refresh
              console.debug('Background refresh error:', err);
            });
          }, refreshDelay);
        }
        return;
      }
        // Regular response handling
      setTables(response.data);
      
      // Mark successful data fetch in performance timeline
      if (window.performance && window.performance.mark) {
        window.performance.mark('tables-data-loaded');
      }
    } catch (error: any) {
      console.error('Error fetching tables:', error);
      
      // More detailed error handling
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền xem danh sách bàn');
        router.push('/');
      } else if (!error.response) {
        message.error('Mất kết nối tới máy chủ. Vui lòng kiểm tra mạng.');
      } else {
        message.error('Không thể tải danh sách bàn');
      }
    } finally {
      setLoading(false);
      
      // Track total fetch time for performance monitoring
      const fetchTotalTime = performance.now() - fetchStartTime;
      if (fetchTotalTime > 500) { // Log fetches taking more than 500ms
        console.warn(`[Performance] Tables data fetch took ${fetchTotalTime.toFixed(2)}ms`);
      }
    }
  }, [statusFilter, user, router]);
  
  // Tách thành useEffect riêng để giảm re-render không cần thiết
  useEffect(() => {
    fetchTablesData();
  }, [fetchTablesData]);
    // Handle status modal
  const showStatusModal = (table: TableData) => {
    setSelectedTable(table);
    form.setFieldsValue({
      status: table.status,
    });
    setIsStatusModalVisible(true);
  };
  
  const handleStatusCancel = () => {
    setIsStatusModalVisible(false);
  };
  
  // Handle status update with optimistic update
  const handleStatusUpdate = async (values: { status: TableStatus }) => {
    if (!selectedTable) {
      message.error('Không có bàn nào được chọn để cập nhật.');
      return;
    }

    const newStatus = values.status;
    const originalStatus = selectedTable.status;
    const tableId = selectedTable.id;

    try {
      // Optimistic UI update
      setTables(prevTables =>
        prevTables.map(t =>
          t.id === tableId ? { ...t, status: newStatus } : t
        )
      );

      // Close modal first for better UX
      setIsStatusModalVisible(false);

      // Make the API call
      await axios.patch(`/tables/${tableId}/status`, { status: newStatus });
      
      // Clear cache in local storage to ensure fresh data
      localStorage.removeItem(`last_refresh_/tables?status=${statusFilter || ''}`);
      
      // Show success message
      message.success('Cập nhật trạng thái bàn thành công!');
      
      // Tải lại danh sách bàn để đảm bảo dữ liệu luôn mới nhất từ server
      fetchTablesData();

    } catch (error: any) {
      // Revert optimistic update
      setTables(prevTables =>
        prevTables.map(t =>
          t.id === selectedTable.id ? { ...t, status: originalStatus } : t
        )
      );

      // Show appropriate error message
      if (error.response?.status === 403) {
        message.error('Bạn không có quyền cập nhật trạng thái bàn');
      } else if (error.response?.status === 400) {
        message.error(error.response?.data?.message || 'Trạng thái không hợp lệ');
      } else if (!error.response) {
        message.error('Mất kết nối tới máy chủ. Vui lòng kiểm tra mạng.');
      } else {
        message.error('Lỗi cập nhật trạng thái bàn. Đang hoàn tác...');
      }
      console.error("Lỗi khi cập nhật trạng thái bàn:", error);
    }
  };
    // Handle create order for a table sử dụng Next.js Router thay vì window.location
  const handleCreateOrder = useCallback((table: TableData) => {
    // Sử dụng router.push thay vì window.location để tránh làm mới toàn bộ trang
    router.push(`/orders/create?tableId=${table.id}`);
  }, [router]);

  // Handle QR code display
  const handleShowQrCode = useCallback((table: TableData) => {
    setSelectedTableForQr(table);
    setQrModalVisible(true);
  }, []);

  const handleQrModalClose = useCallback(() => {
    setQrModalVisible(false);
    setSelectedTableForQr(null);
  }, []);
  
  // Sử dụng useMemo để tránh tính toán lại mỗi khi render
  const getStatusColor = useMemo(() => (status: string) => {
    return statusColors[status as TableStatus] || 'default';
  }, []);
  
  const getStatusLabel = useMemo(() => (status: string) => {
    return statusOptions.find(option => option.value === status)?.label || status;
  }, []);
  
  return (
    <WaiterLayout title="Danh sách bàn">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-bold">Danh sách bàn</div>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => setStatusFilter(value)}
            options={[
              ...statusOptions.map(option => ({
                value: option.value,
                label: option.label,
              })),
            ]}
          />
        </div>          <Suspense fallback={<div className="flex justify-center items-center h-64"><Spin size="large" /></div>}>
            <TablesGrid
              tables={tables}
              loading={loading}
              onStatusChange={showStatusModal}
              onCreateOrder={handleCreateOrder}
              onShowQrCode={handleShowQrCode}
            />
          </Suspense>
      </div>
      
      <Modal
        title="Cập nhật trạng thái bàn"
        open={isStatusModalVisible}
        onCancel={handleStatusCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStatusUpdate}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleStatusCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal>

      <QrCodeModal
        open={qrModalVisible}
        table={selectedTableForQr ? {
          ...selectedTableForQr,
          status: selectedTableForQr.status as any
        } : null}
        onClose={handleQrModalClose}
      />
    </WaiterLayout>
  );
}
