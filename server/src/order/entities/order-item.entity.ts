import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MenuItem } from '../../menu-item/entities/menu-item.entity';
import { Order } from './order.entity';

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('Order', 'items', { onDelete: 'CASCADE' })
  order: Order;

  @Column()
  orderId: number;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.orderItems)
  menuItem: MenuItem;

  @Column()
  menuItemId: number;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
  })
  status: OrderItemStatus;

  @Column({ nullable: true })
  notes: string;
}