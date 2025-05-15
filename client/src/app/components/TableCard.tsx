'use client';

import React, { memo } from 'react';
import { Card, Tag, Button } from 'antd';
import { TableStatus } from '@/app/utils/enums';

// Khai báo các màu trạng thái
const statusColors = {
  [TableStatus.AVAILABLE]: 'success',
  [TableStatus.OCCUPIED]: 'error',
  [TableStatus.RESERVED]: 'warning',
  [TableStatus.CLEANING]: 'processing',
};

const statusLabels = {
  [TableStatus.AVAILABLE]: 'Trống',
  [TableStatus.OCCUPIED]: 'Đang sử dụng',
  [TableStatus.RESERVED]: 'Đã đặt trước',
  [TableStatus.CLEANING]: 'Đang dọn dẹp',
};

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: string;
}

interface TableCardProps {
  table: TableData;
  onStatusChange: (table: TableData) => void;
  onCreateOrder: (table: TableData) => void;
}

// Sử dụng memo để tránh render lại component khi props không thay đổi
const TableCard = memo(({ table, onStatusChange, onCreateOrder }: TableCardProps) => {
  // Using React.useMemo for functions that derive data to avoid recreating them on each render
  const getStatusColor = React.useMemo(() => (status: string) => {
    return statusColors[status as TableStatus] || 'default';
  }, []);
  
  const getStatusLabel = React.useMemo(() => (status: string) => {
    return statusLabels[status as TableStatus] || status;
  }, []);

  // Use callback for event handlers to avoid recreating them on each render
  const handleStatusClick = React.useCallback(() => {
    onStatusChange(table);
  }, [table, onStatusChange]);

  const handleCreateOrderClick = React.useCallback(() => {
    onCreateOrder(table);
  }, [table, onCreateOrder]);
  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>{table.name}</span>
          <Tag color={getStatusColor(table.status)}>
            {getStatusLabel(table.status)}
          </Tag>
        </div>
      }
      className="h-full"
      actions={[
        <Button 
          key="status" 
          onClick={handleStatusClick}
        >
          Đổi trạng thái
        </Button>,
        <Button 
          key="order" 
          type="primary"
          onClick={handleCreateOrderClick}
          disabled={table.status !== TableStatus.OCCUPIED && table.status !== TableStatus.RESERVED}
        >
          Gọi món
        </Button>,
      ]}
    >
      <p><strong>Sức chứa:</strong> {table.capacity} người</p>
    </Card>
  );
});

TableCard.displayName = 'TableCard';

export default TableCard;
