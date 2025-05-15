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
  const [visibleChunks, setVisibleChunks] = useState<number>(5); // Initially show 5 chunks
  
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
  
  // Set up intersection observer for lazy loading tables
  useEffect(() => {
    if (tables.length <= 20) return; // Only apply for larger tables list
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // When the container comes into view, show 5 more chunks
            setVisibleChunks(prev => Math.min(prev + 5, Math.ceil(tables.length / 4)));
          }
        });
      },
      { rootMargin: '200px' } // Start loading 200px before the element is visible
    );
    
    const container = document.getElementById('table-lazy-container');
    if (container) {
      observer.observe(container);
    }
    
    return () => {
      if (container) {
        observer.unobserve(container);
      }
      observer.disconnect();
    };
  }, [tables.length]);
  
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
    // Use windowing/virtual rendering for larger lists to improve performance
  // Only render tables that are currently visible in the viewport
  const isLargeList = tables.length > 20; // Only apply windowing for larger lists
  
  // Group tables into rows for better performance when rendering large lists
  // This reduces the number of components in the tree by chunking them
  const chunkedTables = [];
  const chunkSize = 4; // Number of tables per row
  
  for (let i = 0; i < tables.length; i += chunkSize) {
    chunkedTables.push(tables.slice(i, i + chunkSize));
  }
  
  // Render the table grid with error boundaries and optimization strategies
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div>        {isLargeList ? (
          // For large lists, only render visible chunks to improve performance
          <div style={{ minHeight: chunkedTables.length * 250 }}> {/* Approximate height */}
            {chunkedTables.slice(0, visibleChunks).map((chunk, rowIndex) => (
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
            {chunkedTables.length > visibleChunks && (
              <div className="lazy-load-container" id="table-lazy-container">
                <div className="text-center py-4 text-gray-400">
                  <span>Loading more tables...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // For smaller lists, render everything at once
          <>
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
          </>
        )}
        
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
