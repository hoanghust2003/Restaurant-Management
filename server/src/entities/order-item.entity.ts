import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Dish } from './dish.entity';
import { Order } from './order.entity';
import { OrderItemStatus } from '../enums/order-item-status.enum';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, order => order.id)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'dish_id' })
  dishId: string;

  @ManyToOne(() => Dish, dish => dish.id)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column('int')
  quantity: number;

  @Column('text', { nullable: true })
  note: string;

  @Column({ type: 'enum', enum: OrderItemStatus })
  status: OrderItemStatus;

  @Column({ type: 'timestamp', nullable: true })
  prepared_at: Date;
}
