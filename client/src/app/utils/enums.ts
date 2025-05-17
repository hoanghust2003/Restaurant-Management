// Table status values matching the server-side enum
export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

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
