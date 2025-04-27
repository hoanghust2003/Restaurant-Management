import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Dish } from './dish.entity';
import { Order } from './order.entity';
import { OrderItemStatus } from '../enums/order-item-status.enum';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, order => order.id)
  order: Order;

  @ManyToOne(() => Dish, dish => dish.id)
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
