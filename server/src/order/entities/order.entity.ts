import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Table } from '../../table/entities/table.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../../user/entities/user.entity';
import { Feedback } from './feedback.entity';

export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Table, table => table.orders)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  // Hỗ trợ cả kiểu dữ liệu number (cũ) và string (mới)
  @Column({ name: 'table_id' })
  tableId: string | number;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    name: 'status'
  })
  status: OrderStatus;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => OrderItem, item => item.order, {
    cascade: true,
  })
  items: OrderItem[];

  @OneToMany(() => Feedback, feedback => feedback.order)
  feedbacks: Feedback[];

  @Column({ nullable: true })
  specialInstructions: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}