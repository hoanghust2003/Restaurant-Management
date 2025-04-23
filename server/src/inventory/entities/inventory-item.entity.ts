import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InventoryTransaction } from './inventory-transaction.entity';
import { ItemCategory } from './item-category.enum';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ItemCategory,
    default: ItemCategory.INGREDIENTS,
    enumName: 'item_category_enum' // Thêm enumName để tránh xung đột
  })
  category: ItemCategory;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column()
  unit: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  minQuantity: number;

  @Column({ nullable: true, type: 'timestamp' }) // Thêm kiểu dữ liệu cụ thể
  expiryDate: Date;

  @Column({ nullable: true })
  locationInStorage: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.item)
  transactions: InventoryTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}