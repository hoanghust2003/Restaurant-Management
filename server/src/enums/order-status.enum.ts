export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum OrderItemStatus {
  WAITING = 'waiting',
  PREPARING = 'preparing',
  DONE = 'done',
  FAILED = 'failed',
}
