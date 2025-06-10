/**
 * Models for warehouse management
 */

import { IngredientModel } from './ingredient.model';

/**
 * Supplier model
 */
export interface SupplierModel {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: Date;
  notes?: string;
  active: boolean;
}

/**
 * Batch model for tracking ingredient batches
 */
export interface BatchModel {
  id: string;
  ingredient_id: string;
  ingredient?: IngredientModel;
  supplier_id: string;
  supplier?: SupplierModel;
  quantity: number;
  unit_price: number;
  production_date?: Date;
  expiry_date?: Date;
  import_id: string;
  remaining_quantity: number;
  created_at: Date;
  lot_number?: string;
  status: 'available' | 'depleted' | 'expired' | 'damaged';
}

/**
 * Import model for tracking ingredient imports
 */
export interface ImportModel {
  id: string;
  reference_number: string;
  supplier_id: string;
  supplier?: SupplierModel;
  total_amount: number;
  import_date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: Date;
  items: ImportItemModel[];
}

/**
 * Import item model
 */
export interface ImportItemModel {
  id: string;
  import_id: string;
  ingredient_id: string;
  ingredient?: IngredientModel;
  quantity: number;
  unit_price: number;
  batch_id?: string;
  production_date?: Date;
  expiry_date?: Date;
  lot_number?: string;
}

/**
 * Export model for tracking ingredient exports/usage
 */
export interface ExportModel {
  id: string;
  reference_number: string;
  export_date: Date;
  total_quantity: number;
  reason: 'usage' | 'damaged' | 'expired' | 'other';
  notes?: string;
  created_by: string;
  created_at: Date;
  items: ExportItemModel[];
}

/**
 * Export item model
 */
export interface ExportItemModel {
  id: string;
  export_id: string;
  batch_id: string;
  batch?: BatchModel;
  ingredient_id: string;
  ingredient?: IngredientModel;
  quantity: number;
}

/**
 * DTO for creating a supplier
 */
export interface CreateSupplierDto {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

/**
 * DTO for updating a supplier
 */
export interface UpdateSupplierDto {
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  active?: boolean;
}

/**
 * DTO for creating an import
 */
export interface CreateImportDto {
  importDate: Date;
  supplierId: string;
  note?: string;
  batches: {
    ingredientId: string;
    name: string;
    quantity: number;
    price: number;
    expiry_date: string;
    production_date?: string;
  }[];
}

/**
 * DTO for creating an export
 */
export interface CreateExportDto {
  reference_number?: string;
  export_date: Date;
  reason: 'usage' | 'damaged' | 'expired' | 'other';
  notes?: string;
  items: {
    batch_id: string;
    ingredient_id: string;
    quantity: number;
  }[];
}

/**
 * Location model for warehouse storage locations
 */
export interface LocationModel {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: 'shelf' | 'cooler' | 'freezer' | 'dry_storage' | 'other';
  capacity?: number;
  current_usage?: number;
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  active: boolean;
  created_at: Date;
  updated_at?: Date;
}

/**
 * DTO for creating locations
 */
export interface CreateLocationDto {
  name: string;
  code: string;
  description?: string;
  type: 'shelf' | 'cooler' | 'freezer' | 'dry_storage' | 'other';
  capacity?: number;
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
}

/**
 * DTO for updating locations
 */
export interface UpdateLocationDto extends Partial<CreateLocationDto> {
  active?: boolean;
}

/**
 * Warehouse dashboard statistics
 */
export interface WarehouseStats {
  total_ingredients: number;
  low_stock_count: number;
  expiring_soon_count: number;
  expired_count: number;
  total_value: number;
  recent_imports: number;
  recent_exports: number;
}
