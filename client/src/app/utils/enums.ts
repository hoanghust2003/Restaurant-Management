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
  STAFF = 'staff',
  CHEF = 'chef',
  WAREHOUSE = 'warehouse',
  CUSTOMER = 'customer',
}

// Order status matching server-side enum
export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export const orderStatusText: Record<string, string> = {
  [OrderStatus.PENDING]: 'Chờ xử lý',
  [OrderStatus.IN_PROGRESS]: 'Đang chuẩn bị',
  [OrderStatus.READY]: 'Sẵn sàng',
  [OrderStatus.SERVED]: 'Đã phục vụ',
  [OrderStatus.COMPLETED]: 'Hoàn thành',
  [OrderStatus.CANCELED]: 'Đã hủy',
};

export const orderStatusColors: Record<string, string> = {
  [OrderStatus.PENDING]: 'gold',
  [OrderStatus.IN_PROGRESS]: 'processing',
  [OrderStatus.READY]: 'cyan',
  [OrderStatus.SERVED]: 'blue',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.CANCELED]: 'error',
};

// Order item status matching server-side enum
export enum OrderItemStatus {
  WAITING = 'waiting',
  PREPARING = 'preparing',
  DONE = 'done',
  FAILED = 'failed',
}

export const orderItemStatusText: Record<string, string> = {
  [OrderItemStatus.WAITING]: 'Chờ xử lý',
  [OrderItemStatus.PREPARING]: 'Đang chuẩn bị',
  [OrderItemStatus.DONE]: 'Hoàn thành',
  [OrderItemStatus.FAILED]: 'Thất bại',
};

export const orderItemStatusColors: Record<string, string> = {
  [OrderItemStatus.WAITING]: 'gold',
  [OrderItemStatus.PREPARING]: 'processing',
  [OrderItemStatus.DONE]: 'success',
  [OrderItemStatus.FAILED]: 'error',
};
