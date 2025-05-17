import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { TableEntity } from './table.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'table_id' })
  tableId: string;

  @ManyToOne(() => TableEntity, table => table.id)
  @JoinColumn({ name: 'table_id' })
  table: TableEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column('float')
  total_price: number;

  @Column({ length: 500, nullable: true })
  feedback: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
