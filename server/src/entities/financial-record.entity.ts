import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';
import { FinancialRecordType } from '../enums/financial-record-type.enum';
import { Batch } from './batch.entity';
import { Order } from './order.entity';

@Entity('financial_records')
export class FinancialRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: FinancialRecordType })
  type: FinancialRecordType;

  @Column('float')
  amount: number;

  @Column('text')
  description: string;

  @ManyToOne(() => User, user => user.id)
  created_by: User;

  @ManyToOne(() => Batch, batch => batch.id, { nullable: true })
  related_batch: Batch;

  @ManyToOne(() => Order, order => order.id, { nullable: true })
  related_order_id: Order;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
