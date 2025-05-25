'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { warehouseService } from '@/app/services/warehouse.service';
import { WarehouseStats, ImportModel, ExportModel } from '@/app/models/warehouse.model';
import { useSocket } from './SocketContext';

interface WarehouseContextType {
  stats: WarehouseStats | null;
  recentImports: ImportModel[];
  recentExports: ExportModel[];
  loading: boolean;
  refreshData: () => Promise<void>;
  error: string | null;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

export const WarehouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [recentImports, setRecentImports] = useState<ImportModel[]>([]);
  const [recentExports, setRecentExports] = useState<ExportModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, importsData, exportsData] = await Promise.all([
        warehouseService.getStats(),
        warehouseService.getRecentImports(),
        warehouseService.getRecentExports(),
      ]);

      setStats(statsData);
      setRecentImports(importsData);
      setRecentExports(exportsData);
    } catch (err) {
      console.error('Error fetching warehouse data:', err);
      setError('Không thể tải dữ liệu kho');
      message.error('Không thể tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for warehouse-related events
      socket.on('warehouse:import_created', () => {
        fetchData();
        message.info('Có đơn nhập kho mới');
      });

      socket.on('warehouse:export_created', () => {
        fetchData();
        message.info('Có đơn xuất kho mới');
      });

      socket.on('warehouse:stock_warning', (data: { ingredient: string; quantity: number }) => {
        message.warning(`Cảnh báo: ${data.ingredient} sắp hết hàng (${data.quantity} còn lại)`);
      });

      return () => {
        socket.off('warehouse:import_created');
        socket.off('warehouse:export_created');
        socket.off('warehouse:stock_warning');
      };
    }
  }, [socket]);

  return (
    <WarehouseContext.Provider
      value={{
        stats,
        recentImports,
        recentExports,
        loading,
        refreshData: fetchData,
        error
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};
