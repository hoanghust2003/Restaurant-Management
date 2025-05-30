import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';

/**
 * Interface representing an order with its items
 * Extends the Order entity with an items property
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}
