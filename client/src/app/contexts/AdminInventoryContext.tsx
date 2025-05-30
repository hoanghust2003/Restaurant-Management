'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { IngredientModel } from '../models/ingredient.model';
import { ingredientService } from '../services/ingredient.service';
import { ImportModel, ExportModel, SupplierModel } from '../models/warehouse.model';

interface AdminInventoryContextType {
  ingredients: IngredientModel[];
  imports: ImportModel[];
  exports: ExportModel[];
  suppliers: SupplierModel[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const AdminInventoryContext = createContext<AdminInventoryContextType | undefined>(undefined);

export function useAdminInventory() {
  const context = useContext(AdminInventoryContext);
  if (!context) {
    throw new Error('useAdminInventory must be used within an AdminInventoryProvider');
  }
  return context;
}

export function AdminInventoryProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<IngredientModel[]>([]);
  const [imports, setImports] = useState<ImportModel[]>([]);
  const [exports, setExports] = useState<ExportModel[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshData() {
    try {
      setLoading(true);
      const [ingredientsData, importsData, exportsData, suppliersData] = await Promise.all([
        ingredientService.getAll(),
        // Add other service calls here
      ]);

      setIngredients(ingredientsData);
      setImports(importsData || []);
      setExports(exportsData || []);
      setSuppliers(suppliersData || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu kho');
      message.error('Có lỗi xảy ra khi tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AdminInventoryContext.Provider 
      value={{ 
        ingredients, 
        imports, 
        exports, 
        suppliers,
        loading,
        error,
        refreshData
      }}
    >
      {children}
    </AdminInventoryContext.Provider>
  );
}
