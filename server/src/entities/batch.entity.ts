import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { IngredientImport } from './ingredient-import.entity';
import { BatchStatus } from '../enums/batch-status.enum';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'import_id' })
  importId: string;

  @ManyToOne(() => IngredientImport, import_ => import_.batches)
  @JoinColumn({ name: 'import_id' })
  import: IngredientImport;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, ingredient => ingredient.batches)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ length: 250 })
  name: string;

  @Column('float')
  quantity: number;

  @Column('float')
  remaining_quantity: number;

  @Column('date')
  expiry_date: Date;

  @Column('float')
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;

  @Column({
    type: 'enum',
    enum: BatchStatus,
    default: BatchStatus.AVAILABLE
  })
  status: BatchStatus;
}
