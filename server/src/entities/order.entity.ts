import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { TableEntity } from './table.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TableEntity, table => table.id)
  table: TableEntity;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column('float')
  total_price: number;

  @Column('text', { nullable: true })
  feedback: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
