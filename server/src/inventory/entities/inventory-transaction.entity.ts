import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
import { User } from '../../user/entities/user.entity';
import { TransactionType } from './transaction-type.enum';

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => InventoryItem, (item) => item.transactions)
  item: InventoryItem;

  @Column()
  itemId: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    enumName: 'transaction_type_enum' // Thêm enumName để tránh xung đột
  })
  type: TransactionType;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  reference: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}