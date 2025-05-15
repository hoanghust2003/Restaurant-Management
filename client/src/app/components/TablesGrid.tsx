'use client';

import React, { memo, useState, useEffect } from 'react';
import { Row, Empty, Spin, Alert, Col } from 'antd';
import TableCard from './TableCard';
import ErrorBoundary from './ErrorBoundary';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: string;
}

interface TablesGridProps {
  tables: TableData[];
  loading: boolean;
  onStatusChange: (table: TableData) => void;
  onCreateOrder: (table: TableData) => void;
}

// Fallback component for error states
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50">
      <Alert
        message="Có lỗi xảy ra khi hiển thị bàn"
        description={error.message}
        type="error"
        showIcon
        action={
          <button 
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        }
      />
    </div>
  );
};

// Optimized component with performance monitoring
const TablesGrid = memo(({ tables, loading, onStatusChange, onCreateOrder }: TablesGridProps) => {
  const [renderTime, setRenderTime] = useState<number | null>(null);
  
  // Measure component render time for performance optimization
  useEffect(() => {
    const start = performance.now();
    
    // This runs after render is complete
    return () => {
      const end = performance.now();
      const time = end - start;
      setRenderTime(time);
      
      // Log slow renders to help diagnose performance issues
      if (time > 100) { // Over 100ms is considered slow
        console.warn(`TablesGrid rendered slowly: ${time.toFixed(2)}ms`);
      }
    };
  }, [tables]); // Only measure when tables change
  
  // Early return if loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Đang tải danh sách bàn..." />
      </div>
    );
  }
  
  // Early return if no tables
  if (!tables || tables.length === 0) {
    return <Empty description="Không có bàn nào" />;
  }
  
  // Group tables into rows for better performance when rendering large lists
  // This reduces the number of components in the tree by chunking them
  const chunkedTables = [];
  const chunkSize = 4; // Number of tables per row
  
  for (let i = 0; i < tables.length; i += chunkSize) {
    chunkedTables.push(tables.slice(i, i + chunkSize));
  }
  
  // Render the table grid with error boundaries
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div>
        {chunkedTables.map((chunk, rowIndex) => (
          <Row key={`row-${rowIndex}`} gutter={[16, 16]} className="mb-4">
            {chunk.map(table => (
              <Col key={table.id} xs={24} sm={12} md={8} lg={6}>
                <TableCard
                  table={table}
                  onStatusChange={onStatusChange}
                  onCreateOrder={onCreateOrder}
                />
              </Col>
            ))}
          </Row>
        ))}
        
        {/* Debug performance info in development mode */}
        {process.env.NODE_ENV === 'development' && renderTime && (
          <div className="text-xs text-gray-400 mt-2 text-right">
            Render time: {renderTime.toFixed(2)}ms
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});

TablesGrid.displayName = 'TablesGrid';

export default TablesGrid;
