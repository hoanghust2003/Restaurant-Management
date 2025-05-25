export interface InventoryCosts {
  period: {
    start: Date;
    end: Date;
  };
  costs: {
    import_cost: number;
    export_cost: number;
    current_stock_value: number;
  };
}

export interface StockValue {
  total_value: number;
  ingredients: {
    ingredientId: string;
    name: string;
    unit: string;
    totalQuantity: number;
    totalValue: number;
    batches: {
      id: string;
      name: string; 
      remaining_quantity: number;
      price: number;
      value: number;
      expiry_date: Date;
    }[];
  }[];
}
