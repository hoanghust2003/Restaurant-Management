'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { requestCache } from '../utils/requestCache';

interface RefreshContextType {
  refreshKey: number;
  refreshData: () => void;
  refreshSpecificData: (dataType: string) => void;
  dataRefreshKeys: Record<string, number>;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

// Map of data types to their API endpoints for cache invalidation
const dataTypeToEndpoint: Record<string, string> = {
  tables: '/tables',
  ingredients: '/ingredients',
  dishes: '/dishes',
  orders: '/orders',
  menus: '/menus',
  categories: '/categories',
  suppliers: '/suppliers',
  imports: '/ingredient-imports',
  exports: '/ingredient-exports',
  users: '/users',
};

export const RefreshProvider = ({ children }: { children: ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [dataRefreshKeys, setDataRefreshKeys] = useState<Record<string, number>>({
    tables: 0,
    ingredients: 0,
    dishes: 0,
    orders: 0,
    menus: 0,
    categories: 0,
    suppliers: 0,
    imports: 0,
    exports: 0,
    users: 0,
  });

  const refreshData = useCallback(() => {
    // Clear all cache when doing a global refresh
    requestCache.clear();
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const refreshSpecificData = useCallback((dataType: string) => {
    // Invalidate specific cache when refreshing specific data
    const endpoint = dataTypeToEndpoint[dataType];
    if (endpoint) {
      requestCache.invalidateByPrefix(endpoint);
    }
    
    setDataRefreshKeys(prev => ({
      ...prev,
      [dataType]: (prev[dataType] || 0) + 1
    }));
  }, []);

  return (
    <RefreshContext.Provider value={{ 
      refreshKey, 
      refreshData, 
      refreshSpecificData,
      dataRefreshKeys 
    }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};
