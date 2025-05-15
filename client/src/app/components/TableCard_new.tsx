'use client';

import React, { memo, useCallback, useMemo } from 'react';
import { Card, Tag, Button } from 'antd';
import { TableStatus } from '@/app/utils/enums';

// Status color mapping
const statusColors = {
  [TableStatus.AVAILABLE]: 'success',
  [TableStatus.OCCUPIED]: 'error',
  [TableStatus.RESERVED]: 'warning',
  [TableStatus.CLEANING]: 'processing',
};

// Status label mapping
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

/**
 * TableCard component - displays a restaurant table with its status and actions
 * Optimized with memo to prevent unnecessary re-renders
 */
const TableCard = memo(({ table, onStatusChange, onCreateOrder }: TableCardProps) => {
  // Memoize derived values
  const statusColor = useMemo(() => {
    return statusColors[table.status as TableStatus] || 'default';
  }, [table.status]);
  
  const statusLabel = useMemo(() => {
    return statusLabels[table.status as TableStatus] || table.status;
  }, [table.status]);
  
  // Memoize handlers to prevent recreating functions on each render
  const handleStatusChange = useCallback(() => {
    onStatusChange(table);
  }, [onStatusChange, table]);
  
  const handleCreateOrder = useCallback(() => {
    onCreateOrder(table);
  }, [onCreateOrder, table]);
  
  // Memoize button disabled state
  const orderButtonDisabled = useMemo(() => {
    return table.status !== TableStatus.OCCUPIED && table.status !== TableStatus.RESERVED;
  }, [table.status]);
  
  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span>{table.name}</span>
          <Tag color={statusColor}>
            {statusLabel}
          </Tag>
        </div>
      }
      className="h-full"
      actions={[
        <Button 
          key="status" 
          onClick={handleStatusChange}
        >
          Đổi trạng thái
        </Button>,
        <Button 
          key="order" 
          type="primary"
          onClick={handleCreateOrder}
          disabled={orderButtonDisabled}
        >
          Gọi món
        </Button>,
      ]}
    >
      <p><strong>Sức chứa:</strong> {table.capacity} người</p>
    </Card>
  );
});

// Set displayName for better debugging
TableCard.displayName = 'TableCard';

export default TableCard;
