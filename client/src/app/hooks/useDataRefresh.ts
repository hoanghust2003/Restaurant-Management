'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRefresh } from '@/app/contexts/RefreshContext';

/**
 * Custom hook for managing data refreshing with optimistic updates
 * @param dataType The type of data (e.g. 'tables', 'orders', etc.)
 * @param initialData Initial data (optional)
 * @returns Object with data state and utility functions
 */
export function useDataRefresh<T>(dataType: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const { refreshSpecificData, dataRefreshKeys } = useRefresh();

  // Function to update data and trigger refresh
  const updateData = useCallback((newData: T[]) => {
    setData(newData);
    refreshSpecificData(dataType);
  }, [refreshSpecificData, dataType]);

  // Apply optimistic update (updates local data immediately, then triggers refresh)
  const optimisticUpdate = useCallback((
    id: string, 
    updatedFields: Partial<T>,
    shouldRefresh = true
  ) => {
    // Update local state immediately
    setData(prevData => 
      prevData.map(item => 
        (item as any).id === id ? { ...item, ...updatedFields } : item
      )
    );
    
    // Optionally refresh data from server
    if (shouldRefresh) {
      refreshSpecificData(dataType);
    }
  }, [refreshSpecificData, dataType]);

  // Optimistically add item to collection
  const optimisticAdd = useCallback((
    item: T,
    shouldRefresh = true
  ) => {
    // Add to local state immediately
    setData(prevData => [...prevData, item]);
    
    // Optionally refresh data from server
    if (shouldRefresh) {
      refreshSpecificData(dataType);
    }
  }, [refreshSpecificData, dataType]);

  // Optimistically remove item from collection
  const optimisticRemove = useCallback((
    id: string,
    shouldRefresh = true
  ) => {
    // Remove from local state immediately
    setData(prevData => 
      prevData.filter(item => (item as any).id !== id)
    );
    
    // Optionally refresh data from server
    if (shouldRefresh) {
      refreshSpecificData(dataType);
    }
  }, [refreshSpecificData, dataType]);

  // Manual refresh function
  const refresh = useCallback(() => {
    refreshSpecificData(dataType);
  }, [refreshSpecificData, dataType]);

  // Track when the last refresh happened
  const refreshToken = dataRefreshKeys[dataType] || 0;

  return {
    data,
    setData,
    loading,
    setLoading,
    updateData,
    optimisticUpdate,
    optimisticAdd,
    optimisticRemove,
    refresh,
    refreshToken
  };
}
