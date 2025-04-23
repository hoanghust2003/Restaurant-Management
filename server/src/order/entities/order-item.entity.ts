import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Dish } from '../../menu-item/entities/dish.entity';
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id' })
  orderId: string;

  // Mối quan hệ với Dish (UUID)
  @ManyToOne(() => Dish, dish => dish.orderItems, { nullable: true })
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  // Mối quan hệ với MenuItem (legacy, numeric ID)
  @ManyToOne(() => MenuItem, menuItem => menuItem.orderItems, { nullable: true })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  // Có thể có một trong hai trường ID tùy thuộc vào API nào đang được sử dụng
  @Column({ name: 'dish_id', nullable: true })
  dishId: string;

  @Column({ name: 'menu_item_id', nullable: true })
  menuItemId: number;

  @Column('int')
  quantity: number;

  @Column({ nullable: true })
  notes: string;

  // Hỗ trợ cả hai format cùng một lúc
  @Column('text', { nullable: true })
  note: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.PENDING,
    name: 'status'
  })
  status: OrderItemStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'prepared_at' })
  prepared_at: Date;
}