import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Supplier } from './supplier.entity';

@Entity('ingredient_imports')
export class IngredientImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.id)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column('text', { nullable: true })
  note: string;
  
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
