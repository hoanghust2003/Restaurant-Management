import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Supplier } from './supplier.entity';
import { Batch } from './batch.entity';

@Entity('ingredient_imports')
export class IngredientImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'created_by' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier, supplier => supplier.imports)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ length: 250, nullable: true })
  note: string;

  @OneToMany(() => Batch, batch => batch.import)
  batches: Batch[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
