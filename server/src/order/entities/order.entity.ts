import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Table } from '../../table/entities/table.entity';

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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ManyToOne(() => Table, (table) => table.orders)
  table: Table;

  @Column()
  tableId: number;

  @OneToMany('OrderItem', 'order', {
    cascade: true,
    eager: true,
  })
  items: any[]; // Tránh tham chiếu trực tiếp đến OrderItem

  @Column({ nullable: true })
  specialInstructions: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}