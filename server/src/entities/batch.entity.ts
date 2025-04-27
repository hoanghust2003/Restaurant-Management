import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { Supplier } from './supplier.entity';
import { User } from './user.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  ingredient: Ingredient;

  @Column({ length: 250 })
  name: string;

  @ManyToOne(() => Supplier, supplier => supplier.id)
  supplier: Supplier;

  @Column('float')
  quantity: number;

  @Column('float')
  remaining_quantity: number;

  @Column('date')
  expiry_date: string;

  @Column('float')
  price: number;

  @ManyToOne(() => User, user => user.id)
  created_by: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
