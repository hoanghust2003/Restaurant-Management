import { OrderModel, OrderItemModel } from './order.model';

/**
 * DTO for creating a new customer order
 */
export interface CreateCustomerOrderDto {
  tableId: string;
  items: {
    dishId: string;
    quantity: number;
    note?: string;
  }[];
}
