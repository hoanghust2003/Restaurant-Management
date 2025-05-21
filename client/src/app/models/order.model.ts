import { TableModel } from './table.model';
import { UserModel } from './user.model';
import { DishModel } from './dish.model';
import { OrderStatus, OrderItemStatus } from '@/app/utils/enums';

/**
 * Order model represents an order placed in the restaurant
 */
export interface OrderModel {
  id: string;
  tableId: string;
  table?: TableModel;
  userId: string;
  user?: UserModel;
  status: OrderStatus;
  total_price: number;
  feedback?: string;
  created_at: Date;
  updated_at: Date;
  items?: OrderItemModel[];
  code?: string; // For display/reference purposes
}

/**
 * Order item model represents a dish within an order
 */
export interface OrderItemModel {
  id: string;
  orderId: string;
  dishId: string;
  dish?: DishModel;
  quantity: number;
  note?: string;
  status: OrderItemStatus;
  prepared_at?: Date;
}

/**
 * DTO for creating a new order
 */
export interface CreateOrderDto {
  tableId: string;
  userId: string;
  items: {
    dishId: string;
    quantity: number;
    note?: string;
  }[];
}

/**
 * DTO for updating an existing order
 */
export interface UpdateOrderDto {
  items?: {
    id?: string;
    dishId: string;
    quantity: number;
    note?: string;
  }[];
  removedItems?: string[]; // Item IDs to remove from the order
}
