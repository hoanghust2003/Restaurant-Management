import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { FinancialRecordType } from '../enums/financial-record-type.enum';
import { IngredientImport } from './ingredient-import.entity';
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

  @Column({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({ name: 'related_import_id', nullable: true })
  relatedImportId: string;

  @ManyToOne(() => IngredientImport, importRecord => importRecord.id, { nullable: true })
  @JoinColumn({ name: 'related_import_id' })
  related_import: IngredientImport;

  @Column({ name: 'related_order_id', nullable: true })
  relatedOrderId: string;

  @ManyToOne(() => Order, order => order.id, { nullable: true })
  @JoinColumn({ name: 'related_order_id' })
  related_order: Order;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
