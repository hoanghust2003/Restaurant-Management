// Table status values matching the server-side enum
export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

export const tableStatusText: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: 'Trống',
  [TableStatus.OCCUPIED]: 'Đang sử dụng',
  [TableStatus.RESERVED]: 'Đã đặt trước',
  [TableStatus.CLEANING]: 'Đang dọn dẹp',
};

// User roles enum matching server-side enum
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WAITER = 'waiter',
  CHEF = 'chef',
  CASHIER = 'cashier',
  WAREHOUSE = 'warehouse',
  CUSTOMER = 'customer',
}
