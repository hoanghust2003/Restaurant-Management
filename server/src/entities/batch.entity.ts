import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { User } from './user.entity';

// We'll need to create this entity
import { IngredientImport } from './ingredient-import.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'import_id' })
  importId: string;

  @ManyToOne(() => IngredientImport, import_ => import_.id)
  @JoinColumn({ name: 'import_id' })
  import: IngredientImport;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ length: 250 })
  name: string;

  @Column('float')
  quantity: number;

  @Column('float')
  remaining_quantity: number;

  @Column('date')
  expiry_date: string;

  @Column('float')
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
